import { Wallet } from '@/domain/enterprise/entities/wallet';
import { TransactionRepository } from '../../repositories/transaction.repository';
import { WalletsRepository } from '../../repositories/wallets-repository';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { WALLET_TYPE } from '@/core/types/wallet-type';
import { Notification } from '../../gateways/notification/notification';
import { Authorizer } from '../../gateways/authorizer/authorize';
import { EnvService } from '@/infra/env/env.service';
import { TransactionNotAuthorizedError } from '../errors/transaction-not-authorized-error';
import { UserOnTransactionNotFoundError } from '../errors/user-on-transacton-not-found-error';
import { InvalidUserTypeOnTranferError } from '../errors/invalid-user-type-on-transfer-error';
import { InsuficientBalanceError } from '../errors/insuficient-balance-error';
import { Queue } from '../../gateways/queue/queue';
import { SamePayerAndPayeeIdError } from '../errors/same-payer-and-payee-id-error';

interface MakeTransactionUseCaseRequest {
  payer: string;
  payee: string;
  amount: number;
}

type MakeTransactionUseCaseResponse = {
  isAuthorized: boolean;
};

export class MakeTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly walletsRepository: WalletsRepository,
    private readonly envService: EnvService,
    private readonly authorizer: Authorizer,
    private readonly queue: Queue,
    private readonly notification: Notification,
  ) {}

  public async execute({
    payer,
    payee,
    amount,
  }: MakeTransactionUseCaseRequest): Promise<MakeTransactionUseCaseResponse> {
    if (payer === payee) throw new SamePayerAndPayeeIdError();

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
    if (!sender) throw new UserOnTransactionNotFoundError('Sender not found');
    if (sender.walletType === WALLET_TYPE.MERCHANT)
      throw new InvalidUserTypeOnTranferError();

    return sender;
  }

  private async verifyReceiver(receiverId: string) {
    const receiver = await this.walletsRepository.findById(receiverId);
    if (!receiver)
      throw new UserOnTransactionNotFoundError('Receiver not found');

    return receiver;
  }

  private async verifyPayerBalance(payer: Wallet, amount: number) {
    if (payer.balance <= 0 || payer.balance < amount)
      throw new InsuficientBalanceError();
  }

  private async makeTransaction(payer: Wallet, payee: Wallet, amount: number) {
    // Update the balance on Wallet instance of payer and payee
    payer.decreaseBalance(amount);
    payee.increaseBalance(amount);

    const transaction = Transaction.create({
      sender: payer.id,
      receiver: payee.id,
      amount,
    });

    // First authorize transaction
    const { isAuthorized } = await this.authorizeTransaction(
      transaction,
      this.envService.get('TRANSFER_AUTHORIZER_URL_MOCK'),
    );

    // Do the transaction, put message on queue and send notification
    await this.queue.produce(
      'create-transaction',
      Buffer.from(JSON.stringify({ transaction, payee })),
    );
    await this.transactionRepository.tranfer(transaction, payer, payee);
    // Send notification
    // await this.notification.notificate(transaction, payee);
    // console.table([
    //   { 'payer balance': payer.balance },
    //   { 'payee balance': payee.balance },
    //   { 'sum total': payer.balance + payee.balance },
    // ]);
    return { isAuthorized };
  }

  private async authorizeTransaction(transaction: Transaction, url: string) {
    const { isAuthorized } = await this.authorizer.authorize(transaction, url);

    if (!isAuthorized) {
      throw new TransactionNotAuthorizedError({ isAuthorized: false });
    }

    return { isAuthorized: true };
  }
}
