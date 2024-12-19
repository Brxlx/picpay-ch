import { randomBytes } from 'node:crypto';

import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { Channel, connect, Connection, ConsumeMessage } from 'amqplib';

import { CoreEnv } from '@/core/env/env';
import { Notification } from '@/domain/application/gateways/notification/notification';
import { Queue } from '@/domain/application/gateways/queue/queue';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { Wallet } from '@/domain/enterprise/entities/wallet';

import { Env } from '../env/env-schema';

/**
 * Implements the `Queue` interface and provides functionality for managing an AMQP (RabbitMQ) queue.
 * This class is responsible for establishing a connection to the RabbitMQ server, creating producer and consumer channels,
 * and handling message production and consumption.
 * It also implements the `OnApplicationBootstrap` and `OnModuleDestroy` interfaces to handle initialization and cleanup tasks.
 */
@Injectable()
export class AmqpQueue implements Queue, OnApplicationBootstrap, OnModuleDestroy {
  private connection: Connection | undefined = undefined;
  private producer: Channel | undefined = undefined;
  private consumer: Channel | undefined = undefined;
  private readonly PREFETCH_COUNT = 10; // Processamento paralelo de mensagens

  constructor(
    private readonly envService: CoreEnv<Env>,
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
    try {
      this.connection = await connect(this.envService.get('RABBITMQ_URL'));
      this.connection.setMaxListeners(15);

      // Paralel inicialization of producer and consumer channels
      [this.producer, this.consumer] = await Promise.all([
        this.connection.createChannel(),
        this.connection.createChannel(),
      ]);

      // Configuração de prefetch para processamento paralelo
      await this.consumer.prefetch(this.PREFETCH_COUNT);

      // await this.consume('create-transaction');
      await this.setupQueues('create-transaction');
    } catch (error) {
      console.error('Error initializing AMQP:', error);
      throw new Error('Failed to initialize AMQP');
    }
  }

  private async setupQueues(topic: string): Promise<void> {
    if (!this.consumer) return;

    const dlqName = topic.concat('.dlx');

    // Paralel initialization of DLX and DLQ
    await Promise.all([
      this.consumer.assertExchange('dlx', 'fanout', { durable: true }),
      this.consumer.assertQueue(dlqName, {
        durable: true,
        deadLetterExchange: 'dlx',
      }),
      this.consumer.assertQueue(topic, {
        durable: true,
      }),
    ]);

    await this.consume(topic);
  }

  async produce(topic: string, message: Buffer): Promise<void> {
    if (!this.producer) return;

    try {
      await this.producer.assertQueue(topic);

      const sentMessage = this.producer.sendToQueue(topic, message, {
        persistent: true,
        headers: {
          messageId: randomBytes(16).toString('hex'),
        },
      });

      if (!sentMessage) console.warn('Message not sent');
    } catch (error) {
      console.error('Failed to produce message:', error);
      throw new Error('Failed to produce message');
    }
  }

  async consume(topic: string): Promise<void> {
    if (!this.consumer) return;

    const dlqName = topic.concat('.dlx');

    await this.consumer.consume(topic, async (msg) => {
      if (!msg) return;

      try {
        await this.handleMessage(msg, dlqName);
      } catch (error) {
        console.error('Failed to process message:', error);
        // Rejeita a mensagem sem requeue
        this.consumer?.nack(msg, false, false);
      }
    });
  }

  private serializeStringToTransactionAndPayeeEntities(message: ConsumeMessage): {
    transaction: Transaction;
    payee: Wallet;
  } {
    const parsedMessage = JSON.parse(message.content.toString()) as {
      transaction: Transaction;
      payee: Wallet;
    };
    // Serialize again the parsed message into a full Transaction instance witth getters and setters
    const serializedTransaction = Object.assign(
      Transaction.create(parsedMessage.transaction),
      parsedMessage.transaction,
    );
    const serializedPayee = Object.assign(Wallet.create(parsedMessage.payee), parsedMessage.payee);

    return {
      transaction: serializedTransaction,
      payee: serializedPayee,
    };
  }

  private async handleMessage(msg: ConsumeMessage, dlqName: string) {
    if (!this.consumer) return;
    try {
      // Serialize again the parsed message into a full Transaction instance witth getters and setters
      const { transaction, payee } = this.serializeStringToTransactionAndPayeeEntities(msg);

      // Define um timeout global para toda a operação
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), 30000);
      });

      // Cria o processo principal que inclui todas as etapas necessárias
      const processingPromise = async () => {
        // 1. Gera erro aleatório (pode lançar exceção)
        // TODO: create associeted error
        if (!this.generateRandomError()) throw new Error('Error sendind notification');

        // 2. Aplica o delay de processamento
        // await QueueDelayHelper.delay(
        //   QueueDelayHelper.getRandomDelay(2000, 5000),
        //   `Processando transação ${transaction.id.toString()}`,
        // );

        // 3. Se chegou até aqui, não houve erros no processamento
        // Então podemos enviar a notificação com segurança
        await this.notification.notificate(transaction, payee);

        // 4. Confirma o processamento da mensagem
        this.consumer?.ack(msg);
      };

      // Executa o processamento com timeout
      await Promise.race([processingPromise(), timeoutPromise]);
    } catch (error: any) {
      console.error('Processing error:', error);
      if (this.consumer) {
        this.consumer.nack(msg, false, false);
        this.consumer.sendToQueue(dlqName, msg.content, {
          headers: { ...msg.properties.headers, error: error.message },
        });
      }
    }
  }

  private generateRandomError() {
    const generatedRandomBytes = randomBytes(4);
    const randomNumber = parseFloat((generatedRandomBytes.readUInt32BE() / 0xffffffff).toFixed(2));
    const errorProbability = 0.95; // Probabilidade de ocorrer um erro
    console.log('val do erro é ', randomNumber);
    if (randomNumber < errorProbability) {
      // Simular um erro
      console.error('Error sending notification, sending to DLQ');
      return false;
    }
    return true;
  }
}
