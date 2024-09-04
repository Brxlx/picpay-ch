import { FakeHasher } from 'test/crypto/fake-hasher';
import { makeWallet } from 'test/factories/make-wallet-factory';
import { InMemoryWalletsRepository } from 'test/repositories/in-memory-wallets-repository';
import { InMemoryWalletsTypeRepository } from 'test/repositories/in-memory-wallets-type.repository';

import { Identifiers } from '@/infra/helpers/Identifiers';

import { CreateWalletUseCase } from './create-wallet-use-case';

let inMemoryWalletsRepository: InMemoryWalletsRepository;
let inMemoryWalletsTypeRepository: InMemoryWalletsTypeRepository;
let fakeHasher: FakeHasher;
// system under test
let sut: CreateWalletUseCase;
suite('[Wallet]', () => {
  describe('Create Wallet', () => {
    beforeEach(() => {
      inMemoryWalletsRepository = new InMemoryWalletsRepository();
      inMemoryWalletsTypeRepository = new InMemoryWalletsTypeRepository();
      fakeHasher = new FakeHasher();
      // TODO: create fake wallet type
      // inMemoryWalletsTypeRepository.create();
      sut = new CreateWalletUseCase(
        inMemoryWalletsRepository,
        inMemoryWalletsTypeRepository,
        fakeHasher,
      );
    });
    it('should be able to create a new user wallet', async () => {
      const newWallet = await makeWallet({
        fullName: 'John Doe',
        email: 'johndoe@email.com',
        cpf: '701.180.430-72',
        password: '12345678',
      });
      const result = await sut.execute(newWallet);

      expect(result).toBeTruthy();
      expect(result).toEqual({
        wallet: inMemoryWalletsRepository.items[0],
      });
      expect(result.wallet.id.toString()).toEqual(
        inMemoryWalletsRepository.items[0].id.toString(),
      );
    });
    it('should be able to create a new merchant wallet', async () => {
      const newWallet = await makeWallet({
        fullName: 'John Doe',
        email: 'johndoe@email.com',
        cnpj: Identifiers.generateValidCNPJ(),
        password: '12345678',
      });
      const result = await sut.execute(newWallet);

      expect(result).toBeTruthy();
      expect(result).toEqual({
        wallet: inMemoryWalletsRepository.items[0],
      });
      expect(result.wallet.id.toString()).toEqual(
        inMemoryWalletsRepository.items[0].id.toString(),
      );
    });

    it('should hash wallet password upon registration', async () => {
      const newWallet = await makeWallet({
        fullName: 'John Doe',
        email: 'johndoe@email.com',
        cnpj: '72.033.776/0001-19',
        password: '12345678',
      });

      await sut.execute(newWallet);

      const hashedPassword = await fakeHasher.hash('12345678');

      expect(inMemoryWalletsRepository.items[0].password === hashedPassword);
    });

    it('should compare hashed password with plain text', async () => {
      const newWallet = await makeWallet({ password: '12345678' });

      const hashedPassword = await fakeHasher.hash(newWallet.password);
      const compared = await fakeHasher.compare(
        newWallet.password,
        hashedPassword,
      );

      expect(compared).toBeTruthy();
    });
  });
});
