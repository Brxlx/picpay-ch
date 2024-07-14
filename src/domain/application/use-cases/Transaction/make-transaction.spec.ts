import { Identifiers } from '@/infra/helpers/Identifiers';
import { MakeTransactionUseCase } from './make-transaction-use-case';
import { makeWallet } from 'test/factories/make-wallet-factory';
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions.repository';
import { InMemoryWalletsRepository } from 'test/repositories/in-memory-wallets-repository';
import { FakeNotification } from 'test/notification/fake-notification';
import { Transaction } from '@/domain/enterprise/entities/transaction';

let inMemoryTransactionsRepository: InMemoryTransactionsRepository;
let inMemoryWalletsRepository: InMemoryWalletsRepository;
let fakeNotification: FakeNotification;
// system under test
let sut: MakeTransactionUseCase;
suite('[Transaction]', () => {
  describe('Make Transaction', () => {
    beforeEach(() => {
      inMemoryTransactionsRepository = new InMemoryTransactionsRepository();
      inMemoryWalletsRepository = new InMemoryWalletsRepository();
      fakeNotification = new FakeNotification();
      sut = new MakeTransactionUseCase(
        inMemoryTransactionsRepository,
        inMemoryWalletsRepository,
        fakeNotification,
      );
    });
    it('should be able to make a transaction', async () => {
      const sender = await makeWallet({ balance: 50 });
      const receiver = await makeWallet({
        cnpj: Identifiers.generateValidCNPJ(),
        balance: 20,
      });

      await inMemoryWalletsRepository.create(sender);
      await inMemoryWalletsRepository.create(receiver);

      const amount = 10;

      const { isAuthorized } = await sut.execute({
        payer: sender.id.toString(),
        payee: receiver.id.toString(),
        amount,
      });

      expect(isAuthorized).toBeTruthy();

      const transaction = Transaction.create({
        sender: sender.id,
        receiver: receiver.id,
        amount,
      });

      await fakeNotification.notificate(transaction);
    });
  });
});
