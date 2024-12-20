/**
 * Abstract base class for a queue implementation, providing methods to produce and consume messages.
 */
export abstract class Queue {
  abstract produce(topic: string | string[], message: Buffer): Promise<void>;
  abstract consume(topic: string): Promise<void>;
}
