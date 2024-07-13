import { TransactionRepository } from '../../repositories/transaction.repository';

interface MakeTransactionUseCaseRequest {
  sender: string;
  receiver: string;
  amount: number;
}

type MakeTransactionUseCaseResponse = { isAuthorized: boolean };

export class MakeTransactionUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  public async execute({
    sender,
    receiver,
    amount,
  }: MakeTransactionUseCaseRequest): Promise<MakeTransactionUseCaseResponse> {
    return { isAuthorized: true };
  }
}
