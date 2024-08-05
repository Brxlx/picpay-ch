import { Queue } from '@/domain/application/gateways/queue/queue';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Channel, ConsumeMessage, connect } from 'amqplib';
import { EnvService } from '../env/env.service';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { Notification } from '@/domain/application/gateways/notification/notification';
import { Wallet } from '@/domain/enterprise/entities/wallet';

@Injectable()
export class AmqpQueue implements Queue, OnApplicationBootstrap {
  constructor(
    private readonly envService: EnvService,
    private readonly notification: Notification,
  ) {}

  onApplicationBootstrap() {
    this.consume('create-transaction');
  }

  async produce(topic: string, message: Buffer): Promise<void> {
    const connection = await connect(this.envService.get('RABBITMQ_URL'));

    const producer = await connection.createChannel();

    await producer.assertQueue(topic);

    producer.sendToQueue(topic, message);
    await producer.close();
  }

  async consume(topic: string): Promise<void> {
    const connection = await connect(this.envService.get('RABBITMQ_URL'));
    const dlqName = topic.concat('.dlx');
    const consumer = await connection.createChannel();

    //Queue setup
    await consumer.assertQueue(topic, {
      durable: true,
      deadLetterRoutingKey: dlqName,
    });

    await consumer.consume(topic, async (msg) => {
      if (msg) {
        await this.handleMessage(msg, consumer);
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

  private async handleMessage(msg: ConsumeMessage, consumer: Channel) {
    try {
      // Serialize again the parsed message into a full Transaction instance witth getters and setters
      const { transaction, payee } =
        this.serializeStringToTransactionAndPayeeEntities(msg);
      // Then call notification service to notificate user
      consumer.ack(msg);
      await this.notification.notificate(transaction, payee);
    } catch (err: any) {
      console.log('Error consuming messages, logging...', err.message);
      consumer.nack(msg, false, false);
    }
  }
}
