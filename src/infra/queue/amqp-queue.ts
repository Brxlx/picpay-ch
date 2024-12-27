import { randomBytes } from 'node:crypto';

import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { Channel, connect, Connection, ConsumeMessage } from 'amqplib';

import { CoreEnv } from '@/core/env/env';
import { Notification } from '@/domain/application/gateways/notification/notification';
import { Queue } from '@/domain/application/gateways/queue/queue';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { Wallet } from '@/domain/enterprise/entities/wallet';

import { Env } from '../env/env-schema';
import { InitializingQueueError } from './errors/initializing-queue-error';
import { ProduceMessageError } from './errors/produce-message-error';
import { SendNotificationError } from './errors/send-notification-error';

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

      await this.setupQueues('transaction');
    } catch (error: any) {
      console.error('Error initializing AMQP:', error.message);
      throw new InitializingQueueError();
    }
  }

  private async setupQueues(topic: string): Promise<void> {
    if (!this.consumer) return;

    const dlqName = topic.concat('.dlx');
    const exchangeName = 'transaction';
    const routingKey = 'transaction.create'; // routing key for direct exchange

    // Paralel initialization of Queue and DLQ
    await Promise.all([
      this.consumer.assertExchange(exchangeName, 'direct', { durable: true }),
      this.consumer.assertQueue(topic, {
        durable: true,
        deadLetterExchange: exchangeName,
        deadLetterRoutingKey: `${routingKey}.dlx`,
      }),
      this.consumer.assertQueue(dlqName, {
        durable: true,
      }),
    ]);

    // Bind the queue to the exchange with the routing key
    await Promise.all([
      this.consumer.bindQueue(topic, exchangeName, routingKey),
      this.consumer.bindQueue(dlqName, exchangeName, routingKey.concat('.dlx')),
    ]);

    await this.consume(topic);
  }

  /**
   * Publishes a message to the specified AMQP exchange and routing key.
   *
   * @param topic - The name of the AMQP exchange to publish the message to.
   * @param message - The message to be published, as a Buffer.
   * @returns A Promise that resolves when the message has been published.
   * @throws {ProduceMessageError} If there is an error publishing the message.
   */
  async produce(topic: string, message: Buffer): Promise<void> {
    if (!this.producer) return;
    const exchangeName = topic; // Can vary so best be dynamic
    const routingKey = `${exchangeName}.create`;

    console.log(exchangeName, routingKey);

    // await this.producer.assertExchange(exchangeName, 'direct', {durable: true});

    try {
      const messageId = randomBytes(16).toString('hex');

      const sentMessage = this.producer.publish(exchangeName, routingKey, message, {
        persistent: true,
        correlationId: messageId,
      });

      if (!sentMessage) throw new ProduceMessageError(`Error producing message ${messageId}`);
    } catch (error: any) {
      console.error('Failed to produce message with id:', error.message);
    }
  }

  /**
   * Consumes messages from the specified AMQP topic.
   *
   * This method sets up a consumer to listen for messages on the specified topic.
   * When a message is received, it calls the `handleMessage` method to process the message.
   * If an error occurs during message processing, the message is rejected without requeuing.
   *
   * @param topic - The name of the AMQP topic to consume messages from.
   * @returns A Promise that resolves when the consumer has been set up.
   */
  async consume(topic: string): Promise<void> {
    if (!this.consumer) return;

    await this.consumer.consume(topic, async (msg) => {
      if (!msg) return;

      try {
        await this.handleMessage(msg);
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

  private async handleMessage(msg: ConsumeMessage): Promise<void> {
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
        // Gera erro aleatório (pode lançar exceção)
        if (!this.generateRandomError()) throw new SendNotificationError();

        // Aplica o delay de processamento
        // await QueueDelayHelper.delay(
        //   QueueDelayHelper.getRandomDelay(2000, 5000),
        //   `Processando transação ${transaction.id.toString()}`,
        // );

        // Se chegou até aqui, não houve erros no processamento
        // Então podemos enviar a notificação com segurança
        await this.notification.notificate(transaction, payee);

        // 4. Confirma o processamento da mensagem
        this.consumer?.ack(msg);
      };

      // Executa o processamento com timeout
      await Promise.race([processingPromise(), timeoutPromise]);
    } catch {
      this.consumer.nack(msg, false, false);
    }
  }

  /**
   * Generates a random error with a probability of 0.65 (65%).
   * This is used to simulate errors in the message processing logic.
   * @returns `true` if no error is generated, `false` if an error is generated.
   */
  private generateRandomError(): boolean {
    const generatedRandomBytes = randomBytes(4);
    const randomNumber = parseFloat((generatedRandomBytes.readUInt32BE() / 0xffffffff).toFixed(2));
    const errorProbability = 0.65; // Probabilidade de ocorrer um erro
    console.log('val do erro é ', randomNumber);
    if (randomNumber < errorProbability) {
      // Simular um erro
      console.error('Error sending notification, sending to DLQ');
      return false;
    }
    return true;
  }
}
