import { Wallet } from '@/domain/enterprise/entities/wallet';
import { TransactionRepository } from '../../repositories/transaction.repository';
import { WalletsRepository } from '../../repositories/wallets-repository';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { WALLET_TYPE } from '@/core/types/wallet-type';
import { Notification } from '../../gateways/notification/notification';

interface MakeTransactionUseCaseRequest {
  payer: string;
  payee: string;
  amount: number;
}

type MakeTransactionUseCaseResponse = { isAuthorized: boolean };

export class MakeTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly walletsRepository: WalletsRepository,
    private readonly notification: Notification,
  ) {}

  public async execute({
    payer,
    payee,
    amount,
  }: MakeTransactionUseCaseRequest): Promise<MakeTransactionUseCaseResponse> {
    const payerInDb = await this.verifySender(payer);
    const payeeInDb = await this.verifyReceiver(payee);

    await this.verifyPayerBalance(payerInDb, payeeInDb, amount);

    return { isAuthorized: true };
  }

  private async verifySender(senderId: string) {
    const sender = await this.walletsRepository.findById(senderId);
    if (!sender) throw new Error('Sender not found');
    if (sender.walletType === WALLET_TYPE.MERCHANT)
      throw new Error('Merchants can not tranfer');

    return sender;
  }

  private async verifyReceiver(receiverId: string) {
    const receiver = await this.walletsRepository.findById(receiverId);
    if (!receiver) throw new Error('Receiver not found');

    return receiver;
  }

  private async verifyPayerBalance(
    payer: Wallet,
    payee: Wallet,
    amount: number,
  ) {
    if (payer.balance <= 0 || payer.balance < amount)
      throw new Error('Insuficient balance to make transaction');

    payer.balance -= amount;
    payee.balance += amount;

    console.log(payer, payee);

    const transaction = Transaction.create({
      sender: payer.id,
      receiver: payee.walletTypeId,
      amount,
    });
    await this.transactionRepository.tranfer(transaction);
  }
}
