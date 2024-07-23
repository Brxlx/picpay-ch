import { Queue } from '@/domain/application/gateways/queue/queue';

export class FakeQueue implements Queue {
  async produce(topic: string | string[], _message: Buffer): Promise<void> {
    console.log(`[${topic}] - Message sent to queue`);
  }
  async consume(_topic: string): Promise<void> {
    return;
  }
}
