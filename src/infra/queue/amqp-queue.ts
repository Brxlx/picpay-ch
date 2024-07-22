import { Queue } from '@/domain/application/gateways/queue/queue';
import { Injectable } from '@nestjs/common';
import { connect } from 'amqplib';
import { EnvService } from '../env/env.service';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { Notification } from '@/domain/application/gateways/notification/notification';

@Injectable()
export class AmqpQueue implements Queue {
  constructor(
    private readonly envService: EnvService,
    private readonly notification: Notification,
  ) {}
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
          console.log('msg: ', JSON.parse(msg.content.toString()));
          const parsedMessage = JSON.parse(
            msg.content.toString(),
          ) as Transaction;
          console.log(parsedMessage);
          consumer.ack(msg);
        }
      } catch (err: any) {
        console.log('Error consuming messages, logging...', err.message);
      }
    });
  }
}
