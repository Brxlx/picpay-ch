import { Queue } from '@/domain/application/gateways/queue/queue';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConsumeMessage, connect } from 'amqplib';
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

    const consumer = await connection.createChannel();
    await consumer.assertQueue(topic);

    await consumer.consume(topic, async (msg) => {
      try {
        if (msg) {
          // Serialize again the parsed message into a full Transaction instance witth getters and setters
          const { transaction, payee } =
            this.serializeStringToTransactionAndPayeeEntities(msg);
          // Then call notification service to notificate user
          consumer.ack(msg);
          await this.notification.notificate(transaction, payee);
        }
      } catch (err: any) {
        console.log('Error consuming messages, logging...', err.message);
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
}
