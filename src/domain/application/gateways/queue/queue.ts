export abstract class Queue {
  abstract produce(topic: string | string[], message: Buffer): Promise<void>;
  abstract consume(topic: string): Promise<void>;
}
