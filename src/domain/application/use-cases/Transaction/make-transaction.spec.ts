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

let inMemoryTransactionsRepository: InMemoryTransactionsRepository;
let inMemoryWalletsRepository: InMemoryWalletsRepository;
let envService: FakeEnv;
let fakeAuthorizer: FakeAuthorizer;
let fakeNotification: FakeNotification;
// system under test
let sut: MakeTransactionUseCase;
suite('[Transaction]', () => {
  describe('Make Transaction', () => {
    beforeEach(() => {
      inMemoryTransactionsRepository = new InMemoryTransactionsRepository();
      inMemoryWalletsRepository = new InMemoryWalletsRepository();
      envService = new FakeEnv();
      fakeAuthorizer = new FakeAuthorizer();
      fakeNotification = new FakeNotification();
      sut = new MakeTransactionUseCase(
        inMemoryTransactionsRepository,
        inMemoryWalletsRepository,
        envService as unknown as EnvService,
        fakeAuthorizer,
        fakeNotification,
      );
    });

    it('should be able to make a transaction from User to Merchant', async () => {
      const sender = await makeWallet(
        { balance: 50 },
        new UniqueEntityID('SENDER-ID'),
      );
      const receiver = await makeWallet(
        {
          cnpj: Identifiers.generateValidCNPJ(),
          balance: 20,
        },
        new UniqueEntityID('RECEIVER-ID'),
      );
      console.log(sender);

      await inMemoryWalletsRepository.create(sender);
      await inMemoryWalletsRepository.create(receiver);

      const amount = 10;

      const { isAuthorized } = await sut.execute({
        payer: sender.id.toString(),
        payee: receiver.id.toString(),
        amount,
      });

      expect(isAuthorized).toBeTruthy();
    });
  });
});
