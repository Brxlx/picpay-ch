import { Wallet } from '@/domain/enterprise/entities/wallet';
import { TransactionRepository } from '../../repositories/transaction.repository';
import { WalletsRepository } from '../../repositories/wallets-repository';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { WALLET_TYPE } from '@/core/types/wallet-type';
import { Notification } from '../../gateways/notification/notification';
import { Authorizer } from '../../gateways/authorizer/authorize';
import { EnvService } from '@/infra/env/env.service';

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
    private readonly envService: EnvService,
    private readonly authorizer: Authorizer,
    private readonly notification: Notification,
  ) {}

  public async execute({
    payer,
    payee,
    amount,
  }: MakeTransactionUseCaseRequest): Promise<MakeTransactionUseCaseResponse> {
    const payerInDb = await this.verifySender(payer);
    const payeeInDb = await this.verifyReceiver(payee);

    await this.verifyPayerBalance(payerInDb, amount);
    const { isAuthorized } = await this.makeTransaction(
      payerInDb,
      payeeInDb,
      amount,
    );

    return { isAuthorized };
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

  private async verifyPayerBalance(payer: Wallet, amount: number) {
    if (payer.balance <= 0 || payer.balance < amount)
      throw new Error('Insuficient balance to make transaction');
  }

  private async makeTransaction(payer: Wallet, payee: Wallet, amount: number) {
    // Update the balance on Wallet instance of payer and payee

    payer.balance -= amount;
    payee.balance += amount;

    const transaction = Transaction.create({
      sender: payer.id,
      receiver: payee.id,
      amount,
    });

    // First authorize transaction
    const { isAuthorized } = await this.authorizeTransaction(
      transaction,
      payer,
      payee,
      this.envService.get('TRANSFER_AUTHORIZER_MOCK'),
    );

    if (!isAuthorized) {
      return { isAuthorized: false };
    }
    // Do the transaction
    await this.transactionRepository.tranfer(transaction, payer, payee);
    // Send notification
    await this.notification.notificate(transaction, payee);
    console.table([
      { 'payer balance': payer.balance },
      { 'payee balance': payee.balance },
      { 'sum tota': payer.balance + payee.balance },
    ]);
    return { isAuthorized: true };
  }

  private async authorizeTransaction(
    transaction: Transaction,
    payer: Wallet,
    payee: Wallet,
    url: string,
  ) {
    console.log('urlllll', url);
    const { isAuthorized } = await this.authorizer.authorize(transaction, url);

    if (!isAuthorized) {
      return { isAuthorized: false };
    }

    return { isAuthorized: true };
  }
}
