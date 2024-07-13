import { MakeTransactionUseCase } from './make-transaction-use-case';
import { makeWallet } from 'test/factories/make-wallet-factory';
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions.repository';

let inMemoryTransactionsRepository: InMemoryTransactionsRepository;
// system under test
let sut: MakeTransactionUseCase;
suite('[Transaction]', () => {
  describe('Make Transaction', () => {
    beforeEach(() => {
      inMemoryTransactionsRepository = new InMemoryTransactionsRepository();
      sut = new MakeTransactionUseCase(inMemoryTransactionsRepository);
    });
    it('should be able to make a transaction', async () => {
      const sender = await makeWallet();
      const receiver = await makeWallet();

      const { isAuthorized } = await sut.execute({
        sender: sender.id.toString(),
        receiver: receiver.id.toString(),
        amount: 10,
      });

      expect(isAuthorized).toBeTruthy();
    });
  });
});
