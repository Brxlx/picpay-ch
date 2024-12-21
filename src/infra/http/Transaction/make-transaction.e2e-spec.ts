import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TestDatabase } from 'test/database/test-database';
import { TestDatabaseModule } from 'test/database/test-database.module';
import { TransactionFactory } from 'test/factories/make-transaction-factory';
import { WalletFactory } from 'test/factories/make-wallet-factory';

import { InsuficientBalanceError } from '@/domain/application/use-cases/errors/insuficient-balance-error';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';

suite('[Transaction] (E2E)', () => {
  describe('Make transaction from payer to payee endpoint', () => {
    let app: INestApplication;
    let walletFactory: WalletFactory;
    let transactionFactory: TransactionFactory;
    let testDatabase: TestDatabase;

    let AMOUNT_TO_TRANSFER: number;
    let INITIAL_PAYER_BALANCE: number;
    let INITIAL_PAYEE_BALANCE: number;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule, DatabaseModule, TestDatabaseModule],
        providers: [WalletFactory, TransactionFactory],
      }).compile();

      app = moduleRef.createNestApplication();
      walletFactory = moduleRef.get(WalletFactory);
      transactionFactory = moduleRef.get(TransactionFactory);
      testDatabase = moduleRef.get(TestDatabase);

      await app.init();
    });

    beforeEach(async () => {
      await testDatabase.reset();
    });

    afterAll(async () => {
      await app.close();
    });

    test('[POST] /transfer', async () => {
      AMOUNT_TO_TRANSFER = 10;
      INITIAL_PAYER_BALANCE = 100;
      INITIAL_PAYEE_BALANCE = 30;

      const payer = await walletFactory.makePrismaWallet({ balance: INITIAL_PAYER_BALANCE });
      const payee = await walletFactory.makePrismaWallet({ balance: INITIAL_PAYEE_BALANCE });

      const transaction = await transactionFactory.makePrismaTransaction({
        sender: payer.id,
        receiver: payee.id,
        amount: AMOUNT_TO_TRANSFER,
      });

      const response = await request(app.getHttpServer()).post('/transfer').send({
        payer: transaction.sender.toString(),
        payee: transaction.receiver.toString(),
        amount: transaction.amount,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.isAuthorized).toBe(true);

      // Verify final state through database
      const updatedPayer = await testDatabase.getWalletState(payer.id.toString());
      const updatedPayee = await testDatabase.getWalletState(payee.id.toString());

      expect(updatedPayer!.balance).toBe(INITIAL_PAYER_BALANCE - AMOUNT_TO_TRANSFER);
      expect(updatedPayee!.balance).toBe(INITIAL_PAYEE_BALANCE + AMOUNT_TO_TRANSFER);

      const didTransaction = await testDatabase.getTransactionRecord(
        payer.id.toString(),
        payee.id.toString(),
        transaction.amount,
      );

      expect(didTransaction).toBeTruthy();
      expect(transaction.amount).toBe(AMOUNT_TO_TRANSFER);
    });

    it('should fail when payer has insufficient funds', async () => {
      // Arrange
      const payer = await walletFactory.makePrismaWallet({
        balance: 50,
      });

      const payee = await walletFactory.makePrismaWallet({
        balance: 30,
      });

      // Act
      const response = await request(app.getHttpServer()).post('/transfer').send({
        payer: payer.id.toString(),
        payee: payee.id.toString(),
        amount: 100,
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain(new InsuficientBalanceError().message);

      const unchangedPayer = await testDatabase.getWalletState(payer.id.toString());
      const unchangedPayee = await testDatabase.getWalletState(payee.id.toString());

      expect(unchangedPayer!.balance).toBe(50);
      expect(unchangedPayee!.balance).toBe(30);

      // Verify no transaction was created
      const transactions = await testDatabase.getAllWalletTransactions(payer.id.toString());
      expect(transactions).toHaveLength(0);
    });
  });
});
