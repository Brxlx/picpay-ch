import { randomBytes } from 'node:crypto';

import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { Channel, connect, Connection, ConsumeMessage } from 'amqplib';
import {
  catchError,
  from,
  mergeMap,
  Observable,
  race,
  Subject,
  tap,
  throwError,
  timer,
} from 'rxjs';

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
  private $messageProcessor: Subject<ConsumeMessage>;
  private isInitialized = false;
  private readonly PREFETCH_COUNT = 3; // Processamento paralelo de mensagens
  private readonly MESSAGE_SEND_TIMEOUT = 30000; // 30 seconds

  constructor(
    private readonly envService: CoreEnv<Env>,
    private readonly notification: Notification,
  ) {
    this.$messageProcessor = new Subject<ConsumeMessage>();
  }

  async onApplicationBootstrap() {
    await this.initialize();
    this.setupMessageProcessor();
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
      this.isInitialized = true;
    } catch (error: any) {
      console.error('Error initializing AMQP:', error.message);
      this.isInitialized = false;
      throw new InitializingQueueError();
    }
  }

  private async setupQueues(topic: string): Promise<void> {
    if (!this.producer) return;
    if (!this.consumer) return;

    const dlqName = topic.concat('.dlx');
    const exchangeName = 'transaction';
    const routingKey = 'transaction.create'; // routing key for direct exchange
    const waitingQueueName = topic.concat('.waiting');

    // Paralel initialization of Queue and DLQ
    await Promise.all([
      this.consumer.assertExchange(exchangeName, 'direct', { durable: true }),
      this.consumer.assertQueue(topic, {
        durable: true,
        deadLetterExchange: exchangeName,
        deadLetterRoutingKey: `${routingKey}.dlx`,
      }),
      this.consumer.assertQueue(waitingQueueName, {
        durable: true,
        deadLetterExchange: exchangeName,
        deadLetterRoutingKey: routingKey,
        arguments: {
          'x-dead-letter-exchange': exchangeName,
          'x-dead-letter-routing-key': routingKey,
        },
      }),
      this.consumer.assertQueue(dlqName, {
        durable: true,
      }),
    ]);

    // Bind the queue to the exchange with the routing key
    await Promise.all([
      this.consumer.bindQueue(topic, exchangeName, routingKey),
      this.consumer.bindQueue(dlqName, exchangeName, routingKey.concat('.dlx')),
      this.consumer.bindQueue(waitingQueueName, exchangeName, routingKey.concat('.waiting')),
    ]);

    await this.consume(topic);
  }
  private setupMessageProcessor() {
    if (!this.isInitialized) {
      console.error('❌ Tentativa de configurar processador antes da inicialização');
      return;
    }

    this.$messageProcessor
      .pipe(
        mergeMap((message) => {
          return this.handleMessage(message);
        }, this.PREFETCH_COUNT),
      )
      .subscribe({
        error: (error) => {
          console.error('❌ Error processing message:', error);
          // Re-initialize the message processor
          this.setupMessageProcessor();
        },
      });
  }

  /**
   * Publishes a message to the specified AMQP exchange and routing key.
   *
   * @param topic - The name of the AMQP exchange to publish the message to.
   * @param message - The message to be published, as a Buffer.
   * @returns A Promise that resolves when the message has been published.
   * @throws {ProduceMessageError} If there is an error publishing the message.
   */
  async produce(topic: string, message: Buffer, delayMs?: number): Promise<void> {
    if (!this.producer) return;
    const exchangeName = topic; // Can vary so best be dynamic
    const routingKey = delayMs ? `${exchangeName}.create.waiting` : `${exchangeName}.create`;

    // await this.producer.assertExchange(exchangeName, 'direct', {durable: true});

    try {
      const messageId = randomBytes(16).toString('hex');

      const sentMessage = this.producer.publish(exchangeName, routingKey, message, {
        persistent: true,
        correlationId: messageId,
        expiration: delayMs?.toString(),
        headers: {
          'x-delay': delayMs,
        },
      });

      if (!sentMessage) throw new ProduceMessageError(`Error producing message ${messageId}`);
      console.log(
        `[${messageId}] 📤 Mensagem publicada ${delayMs ? `com delay de ${delayMs}ms` : 'sem delay'}`,
      );
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
        // await this.handleMessage(msg);
        this.$messageProcessor.next(msg);
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

  private handleMessage(msg: ConsumeMessage): Observable<void> {
    // Verifica o estado da fila antes de processar
    if (!this.isInitialized || !this.consumer) {
      console.error(
        `[${msg.properties.correlationId}] ❌ Tentativa de processar mensagem com fila não inicializada`,
      );
      return from(Promise.resolve()).pipe(
        mergeMap(() => {
          this.consumer?.nack(msg, false, false);
          return throwError(() => new SendNotificationError());
        }),
      );
    }

    return race(
      from(Promise.resolve()).pipe(
        mergeMap(() => {
          const { transaction, payee } = this.serializeStringToTransactionAndPayeeEntities(msg);

          // Simula o erro aleatório
          if (!this.generateRandomError()) {
            this.consumer?.nack(msg, false, false);
            return from(Promise.resolve()); // Completamos o observable sem erro
          }

          // Processa a notificação
          return from(this.notification.notificate(transaction, payee)).pipe(
            tap(() => {
              this.consumer?.ack(msg);
            }),
            catchError((error) => {
              console.error(`[${msg.properties.correlationId}] Erro ao enviar notificação:`, error);
              this.consumer?.nack(msg, false, false);
              return from(Promise.resolve()); // Completamos o observable sem erro
            }),
          );
        }),
      ),
      timer(this.MESSAGE_SEND_TIMEOUT).pipe(
        mergeMap(() => {
          console.error(`[${msg.properties.correlationId}] ⏰ Timeout no processamento`);
          this.consumer?.nack(msg, false, false);
          return from(Promise.resolve()); // Completamos o observable sem erro
        }),
      ),
    ).pipe(
      catchError((error) => {
        console.error(`[${msg.properties.correlationId}] 🔥 Unexpected error:`, error);
        this.consumer?.nack(msg, false, false);
        return from(Promise.resolve());
      }),
    );
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
