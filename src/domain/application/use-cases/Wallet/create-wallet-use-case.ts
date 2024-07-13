import { Wallet } from '@/domain/enterprise/entities/wallet';
import { WalletsRepository } from '../../repositories/wallets-repository';
import { HashGenerator } from '../../gateways/crypto/hash-generator';
import { WalletsTypeRepository } from '../../repositories/wallets-type.repository';
import { WALLET_TYPE } from '@/core/types/wallet-type';
import { Identifiers } from '@/infra/helpers/Identifiers';

interface CreateWalletUseCaseRequest {
  fullName: string;
  email: string;
  password: string;
  cpf: string;
  cnpj?: string;
}

type CreateWalletUseCaseResponse = { wallet: Wallet };

export class CreateWalletUseCase {
  constructor(
    private readonly walletsRepository: WalletsRepository,
    private readonly walletTypeRepository: WalletsTypeRepository,
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
      balance: 0,
      walletTypeId: (await this.getWalletTypeId(cnpj)).id,
    });

    // Save on repository
    await this.walletsRepository.create(newWallet);

    return { wallet: newWallet };
  }

  private async validateCpf(cpf: string) {
    if (!Identifiers.validateCPF(cpf)) throw new Error('Invalid CPF');
    const cpfWalletOnDb = await this.walletsRepository.findByCpfCnpj(cpf);
    if (cpfWalletOnDb) throw new Error('Wallet account already exists');

    return cpf;
  }

  private async validateCnpj(cnpj: string) {
    if (cnpj) {
      if (!Identifiers.validateCNPJ(cnpj)) throw new Error('Invalid CNPJ');
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

  private async getWalletTypeId(cnpj?: string) {
    const walletType = await this.walletTypeRepository.findByDescription(
      cnpj ? WALLET_TYPE.MERCHANT : WALLET_TYPE.USER,
    );
    if (!walletType) throw new Error('Não deveria dar este erro');
    return walletType;
  }
}
