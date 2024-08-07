import { Queue } from '@/domain/application/gateways/queue/queue';
import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { Channel, Connection, ConsumeMessage, connect } from 'amqplib';
import { EnvService } from '../env/env.service';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { Notification } from '@/domain/application/gateways/notification/notification';
import { Wallet } from '@/domain/enterprise/entities/wallet';

@Injectable()
export class AmqpQueue
  implements Queue, OnApplicationBootstrap, OnModuleDestroy
{
  private connection: Connection | undefined = undefined;
  private producer: Channel | undefined = undefined;
  private consumer: Channel | undefined = undefined;

  constructor(
    private readonly envService: EnvService,
    private readonly notification: Notification,
  ) {}

  async onApplicationBootstrap() {
    await this.initialize();
  }

  async onModuleDestroy() {
    await this.producer?.close();
    await this.consumer?.close();
    await this.connection?.close();
  }

  private async initialize() {
    this.connection = await connect(this.envService.get('RABBITMQ_URL'));
    this.connection.setMaxListeners(15);
    this.producer = await this.connection.createChannel();
    this.consumer = await this.connection.createChannel();
    await this.consume('create-transaction');
  }

  async produce(topic: string, message: Buffer): Promise<void> {
    if (!this.producer) return;
    // this.producer = await this.connection.createChannel();

    await this.producer.assertQueue(topic);

    this.producer.sendToQueue(topic, message);
  }

  async consume(topic: string): Promise<void> {
    console.log(process.listenerCount('create-transaction'));
    if (!this.consumer) return;
    const dlqName = topic.concat('.dlx');
    // this.consumer = await this.connection.createChannel();

    //Queue setup
    await this.consumer.assertExchange('dlx', 'fanout', { durable: true });
    await this.consumer.assertQueue(dlqName, {
      durable: true,
      deadLetterExchange: 'dlx',
    });
    await this.consumer.assertQueue(topic, {
      durable: true,
    });

    await this.consumer.consume(topic, async (msg) => {
      if (msg) {
        if (!this.consumer) return;
        await this.handleMessage(msg, dlqName);
      }
    });
  }

  private serializeStringToTransactionAndPayeeEntities(
    message: ConsumeMessage,
  ): { transaction: Transaction; payee: Wallet } {
    const parsedMessage = JSON.parse(message.content.toString()) as {
      transaction: Transaction;
      payee: Wallet;
    };
    // Serialize again the parsed message into a full Transaction instance witth getters and setters
    const serializedTransaction = Object.assign(
      Transaction.create(parsedMessage.transaction),
      parsedMessage.transaction,
    );
    const serializedPayee = Object.assign(
      Wallet.create(parsedMessage.payee),
      parsedMessage.payee,
    );

    return {
      transaction: serializedTransaction,
      payee: serializedPayee,
    };
  }

  private async handleMessage(
    msg: ConsumeMessage,
    // consumer: Channel,
    dlqName: string,
  ) {
    if (!this.consumer) return;
    try {
      // Serialize again the parsed message into a full Transaction instance witth getters and setters
      const { transaction, payee } =
        this.serializeStringToTransactionAndPayeeEntities(msg);
      // Then call notification service to notificate user
      // throw new Error('Error sending notification, sending to DLQ');
      this.generateRandomError();
      this.consumer?.ack(msg);
      await this.notification.notificate(transaction, payee);
    } catch (err: any) {
      console.log('Error consuming messages, logging...', err.message);
      this.consumer.nack(msg, false, false);
      this.consumer.sendToQueue(dlqName, Buffer.from(JSON.stringify(msg)));
    }
  }

  private generateRandomError() {
    const generatedRandomBytes = randomBytes(4);
    const randomNumber = parseFloat(
      (generatedRandomBytes.readUInt32BE() / 0xffffffff).toFixed(2),
    );
    const errorProbability = 0.6; // Probabilidade de ocorrer um erro
    console.log('val do erro é ', randomNumber);
    if (randomNumber < errorProbability) {
      // Simular um erro
      throw new Error('Error sending notification, sending to DLQ');
    }
  }
}
