import { FakeHasher } from 'test/crypto/fake-hasher';
import { InMemoryWalletsRepository } from 'test/repositories/in-memory-wallets-repository';

import { CreateWalletUseCase } from './create-wallet-use-case';

let inMemoryStudentsRepository: InMemoryWalletsRepository;
let fakeHasher: FakeHasher;
// system under test
let sut: CreateWalletUseCase;

describe('Create Wallet', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryWalletsRepository();
    fakeHasher = new FakeHasher();

    sut = new CreateWalletUseCase(inMemoryStudentsRepository, fakeHasher);
  });
  it('should be able to register a new student', async () => {
    const result = await sut.execute({
      fullName: 'John Doe',
      email: 'johndoe@email.com',
      cpfCnpj: '701.180.430-72',
      password: '12345678',
    });

    expect(result).toBeTruthy();
    expect(result).toEqual({
      wallet: inMemoryStudentsRepository.items[0],
    });
    expect(result.wallet.id.toString()).toEqual(
      inMemoryStudentsRepository.items[0].id.toString(),
    );
  });

  it('should hash student password upon registration', async () => {
    await sut.execute({
      fullName: 'John Doe',
      email: 'johndoe@email.com',
      cpfCnpj: '',
      password: '12345678',
    });

    const hashedPassword = await fakeHasher.hash('12345678');

    expect(inMemoryStudentsRepository.items[0].password === hashedPassword);
  });
});
