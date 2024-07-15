import { Identifiers } from '@/infra/helpers/Identifiers';
import { MakeTransactionUseCase } from './make-transaction-use-case';
import { makeWallet } from 'test/factories/make-wallet-factory';
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions.repository';
import { InMemoryWalletsRepository } from 'test/repositories/in-memory-wallets-repository';
import { FakeNotification } from 'test/notification/fake-notification';
import { FakeAuthorizer } from 'test/authorizer/fake-authorizer';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { FakeEnv } from 'test/env/fake-env';
import { EnvService } from '@/infra/env/env.service';
import { makeTransaction } from 'test/factories/make-transaction-factory';

let PAYER_INITIAL_AMOUNT: number;
let PAYEE_INITIAL_AMOUNT: number;
let inMemoryTransactionsRepository: InMemoryTransactionsRepository;
let inMemoryWalletsRepository: InMemoryWalletsRepository;
let fakeEnvService: FakeEnv;
let fakeAuthorizer: FakeAuthorizer;
let fakeNotification: FakeNotification;
// system under test
let sut: MakeTransactionUseCase;
suite('[Transaction]', () => {
  describe('Make Transaction', () => {
    beforeEach(() => {
      PAYER_INITIAL_AMOUNT = 50;
      PAYEE_INITIAL_AMOUNT = 20;
      inMemoryTransactionsRepository = new InMemoryTransactionsRepository();
      inMemoryWalletsRepository = new InMemoryWalletsRepository();
      fakeEnvService = new FakeEnv();
      fakeAuthorizer = new FakeAuthorizer();
      fakeNotification = new FakeNotification();
      sut = new MakeTransactionUseCase(
        inMemoryTransactionsRepository,
        inMemoryWalletsRepository,
        fakeEnvService as unknown as EnvService,
        fakeAuthorizer,
        fakeNotification,
      );
    });

    it('should be able to make a transaction from User to Merchant', async () => {
      const sender = await makeWallet(
        { balance: PAYER_INITIAL_AMOUNT },
        new UniqueEntityID('SENDER-ID'),
      );
      expect(sender.balance).toEqual(PAYER_INITIAL_AMOUNT);

      const receiver = await makeWallet(
        {
          cnpj: Identifiers.generateValidCNPJ(),
          balance: PAYEE_INITIAL_AMOUNT,
        },
        new UniqueEntityID('RECEIVER-ID'),
      );
      expect(receiver.balance).toEqual(PAYEE_INITIAL_AMOUNT);

      await inMemoryWalletsRepository.create(sender);
      await inMemoryWalletsRepository.create(receiver);

      const transaction = await makeTransaction({
        sender: sender.id,
        receiver: receiver.id,
        amount: 25,
      });

      const { isAuthorized } = await sut.execute({
        payer: transaction.sender.toString(),
        payee: transaction.receiver.toString(),
        amount: transaction.amount,
      });

      expect(isAuthorized).toBeTruthy();
      expect(sender.balance).toEqual(PAYER_INITIAL_AMOUNT - transaction.amount);
      expect(receiver.balance).toEqual(
        PAYEE_INITIAL_AMOUNT + transaction.amount,
      );
    });
  });
});
