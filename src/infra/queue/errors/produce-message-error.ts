import { QueueError } from '@/domain/application/gateways/errors/queue-error';

export class ProduceMessageError extends Error implements QueueError {
  constructor(message: string) {
    super(message);
  }
}
