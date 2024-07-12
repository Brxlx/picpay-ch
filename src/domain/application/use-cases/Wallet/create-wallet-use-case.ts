import { Wallet } from '@/domain/enterprise/entities/wallet';
import { WalletsRepository } from '../../repositories/wallets-repository';
import { HashGenerator } from '../../gateways/crypto/hash-generator';

interface CreateWalletUseCaseRequest {
  fullName: string;
  email: string;
  password: string;
  cpf: string;
  cnpj?: string;
  // walletType?: WALLET_TYPE;
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
    cpf,
    cnpj,
  }: CreateWalletUseCaseRequest): Promise<CreateWalletUseCaseResponse> {
    await this.validateCpf(cpf);

    if (cnpj) await this.validateCnpj(cnpj);

    await this.validateEmail(email);

    // Cryptograph password
    const hashedPassword = await this.hashGenerator.hash(password);

    // Create new Wallet instance
    const newWallet = Wallet.create({
      fullName,
      email,
      password: hashedPassword,
      cpf,
      cnpj,
      // walletType,
      balance: 0,
    });

    // Save on repository
    await this.walletsRepository.create(newWallet);

    return { wallet: newWallet };
  }

  private async validateCpf(cpf: string) {
    if (cpf.length !== 14) throw new Error('Invalid CPF');
    const cpfWalletOnDb = await this.walletsRepository.findByCpfCnpj(cpf);
    if (cpfWalletOnDb) throw new Error('Wallet account already exists');

    return cpf;
  }

  private async validateCnpj(cnpj: string) {
    if (cnpj) {
      if (cnpj.length !== 18) throw new Error('Invalid CNPJ');
      const cnpjWalletOnDb = await this.walletsRepository.findByCpfCnpj(cnpj);
      if (cnpjWalletOnDb) throw new Error('Wallet account already exists');
      return cnpj;
    }
    return;
  }

  private async validateEmail(email: string) {
    const emailWalletOnDb = await this.walletsRepository.findByEmail(email);

    if (emailWalletOnDb) throw new Error('Wallet email already exists');

    return email;
  }
}
