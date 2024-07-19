import { UseCaseError } from './use-case-error';

export class NotAllowedError extends Error implements UseCaseError {
  message: string;
  constructor(message?: string | Record<string, any>) {
    super();
    this.message = (message ?? 'Not allowed') as string;
  }
}
