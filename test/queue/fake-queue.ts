import { Queue } from '@/domain/application/gateways/queue/queue';

export class FakeQueue implements Queue {
  async produce(topic: string | string[], _message: Buffer, _?: number): Promise<void> {
    console.log(`[${topic}] - Message sent to queue`);
  }
  async consume(topic: string): Promise<void> {
    console.log(`[${topic}] - Notification sent to user`);
  }
}
