import { UseCaseError } from './use-case-error';

export class NotAllowedError implements UseCaseError {
  message: string | Record<string, any>;
  constructor(message?: string | Record<string, any>) {
    this.message = message ?? 'Not allowed';
  }
}
