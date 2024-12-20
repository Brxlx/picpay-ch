import { QueueErrorMessages } from '@/core/consts/queue-error-messages';
import { QueueError } from '@/domain/application/gateways/errors/queue-error';

export class SendNotificationError extends Error implements QueueError {
  constructor() {
    super(QueueErrorMessages.INITIALIZING_QUEUE_ERROR);
  }
}
