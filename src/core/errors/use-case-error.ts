export class UseCaseError {
  message: string | Record<string, any>;
  constructor(message: string | Record<string, any>) {
    this.message = message;
  }
}
