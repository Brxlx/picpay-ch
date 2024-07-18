import { UseCaseError } from '@/core/errors/use-case-error';

export class EmailAlreadyExistsError implements UseCaseError {
  message: string | Record<string, any> = 'Email already exists';
}
