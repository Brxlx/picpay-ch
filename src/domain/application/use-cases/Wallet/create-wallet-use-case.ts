import { Wallet } from '@/domain/enterprise/entities/wallet';
import { WalletsRepository } from '../../repositories/wallets-repository';
import { WALLET_TYPE } from '@/core/types/wallet-type';
import { HashGenerator } from '../../gateways/crypto/hash-generator';

interface CreateWalletUseCaseRequest {
  fullName: string;
  email: string;
  password: string;
  cpfCnpj: string;
  walletType?: WALLET_TYPE;
}

type CreateWalletUseCaseResponse = { wallet: Wallet };

export class CreateWalletUseCase {
  constructor(
    private readonly walletsRepository: WalletsRepository,
    private readonly hashGenerator: HashGenerator,
  ) {}

  public async execute({
    fullName,
    email,
    password,
    cpfCnpj,
    walletType,
  }: CreateWalletUseCaseRequest): Promise<CreateWalletUseCaseResponse> {
    let walletOnDb = await this.walletsRepository.findByCpfCnpj(cpfCnpj);

    if (walletOnDb) throw new Error('Wallet account already exists');

    walletOnDb = await this.walletsRepository.findByEmail(email);

    if (walletOnDb) throw new Error('Wallet email already exists');

    // TODO: Verify CpfCnpj

    // Cryptograph password
    const hashedPassword = await this.hashGenerator.hash(password);
    // Create new Wallet instance
    const newWallet = Wallet.create(
      Wallet.create({
        fullName,
        email,
        password: hashedPassword,
        cpfCnpj,
        walletType: walletType ?? WALLET_TYPE.USER,
        balance: 0,
      }),
    );

    // Save on repository
    await this.walletsRepository.create(newWallet);

    return { wallet: newWallet };
  }

  // private verifyCpfCnpj(cpfCnpj: string) {}
}
