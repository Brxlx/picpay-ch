import { FakeAuthorizer } from 'test/authorizer/fake-authorizer';
import { FakeEnv } from 'test/env/fake-env';
import { makeTransaction } from 'test/factories/make-transaction-factory';
import { makeWallet } from 'test/factories/make-wallet-factory';
import { FakeNotification } from 'test/notification/fake-notification';
import { FakeQueue } from 'test/queue/fake-queue';
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions.repository';
import { InMemoryWalletsRepository } from 'test/repositories/in-memory-wallets-repository';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { EnvService } from '@/infra/env/env.service';
import { Identifiers } from '@/infra/helpers/Identifiers';

import { InsuficientBalanceError } from '../errors/insuficient-balance-error';
import { InvalidUserTypeOnTranferError } from '../errors/invalid-user-type-on-transfer-error';
import { MakeTransactionUseCase } from './make-transaction-use-case';

let PAYER_INITIAL_AMOUNT: number;
let PAYEE_INITIAL_AMOUNT: number;
let inMemoryTransactionsRepository: InMemoryTransactionsRepository;
let inMemoryWalletsRepository: InMemoryWalletsRepository;
let fakeEnvService: FakeEnv;
let fakeAuthorizer: FakeAuthorizer;
let fakeQueue: FakeQueue;
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
      fakeQueue = new FakeQueue();
      fakeNotification = new FakeNotification();
      sut = new MakeTransactionUseCase(
        inMemoryTransactionsRepository,
        inMemoryWalletsRepository,
        fakeEnvService as unknown as EnvService,
        fakeAuthorizer,
        fakeQueue,
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
        amount: 25.98,
      });

      const { isAuthorized } = await sut.execute({
        payer: transaction.sender.toString(),
        payee: transaction.receiver.toString(),
        amount: transaction.amount,
      });

      await fakeQueue.consume('create-transaction');
      await fakeNotification.notificate(transaction, receiver);

      expect(isAuthorized).toBeTruthy();
      expect(sender.balance).toEqual(PAYER_INITIAL_AMOUNT - transaction.amount);
      expect(receiver.balance).toEqual(
        PAYEE_INITIAL_AMOUNT + transaction.amount,
      );
    });

    it('should not be able to make a transaction from Merchant to User', async () => {
      const sender = await makeWallet(
        {
          balance: PAYER_INITIAL_AMOUNT,
          cnpj: Identifiers.generateValidCNPJ(),
        },
        new UniqueEntityID('SENDER-ID'),
      );
      expect(sender.balance).toEqual(PAYER_INITIAL_AMOUNT);

      const receiver = await makeWallet(
        {
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

      await expect(async () => {
        await sut.execute({
          payer: transaction.sender.toString(),
          payee: transaction.receiver.toString(),
          amount: transaction.amount,
        });
      }).rejects.toBeInstanceOf(InvalidUserTypeOnTranferError);
    });

    it('should not be able to make a transaction from User with insuficient balance', async () => {
      PAYER_INITIAL_AMOUNT = 10;

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

      await expect(async () => {
        await sut.execute({
          payer: transaction.sender.toString(),
          payee: transaction.receiver.toString(),
          amount: transaction.amount,
        });
      }).rejects.toStrictEqual(new InsuficientBalanceError());
    });
  });
});
