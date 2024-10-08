import { WALLET_TYPE } from '@/core/types/wallet-type';
import { Wallet } from '@/domain/enterprise/entities/wallet';
import { Identifiers } from '@/infra/helpers/Identifiers';

import { HashGenerator } from '../../gateways/crypto/hash-generator';
import { WalletsRepository } from '../../repositories/wallets-repository';
import { WalletsTypeRepository } from '../../repositories/wallets-type.repository';
import { EmailAlreadyExistsError } from '../errors/email-already-exists-error';
import { InvalidIdentifierError } from '../errors/invalid-identifier-error';
import { WalletAccountExistsError } from '../errors/wallet-account-exists-error';

interface CreateWalletUseCaseRequest {
  fullName: string;
  email: string;
  password: string;
  cpf: string;
  cnpj?: string;
  balance?: number;
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
    balance,
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
      balance: balance ?? 0,
      walletTypeId: (await this.getWalletTypeId(cnpj)).id,
    });

    // Save on repository
    await this.walletsRepository.create(newWallet);

    return { wallet: newWallet };
  }

  private async validateCpf(cpf: string) {
    if (!Identifiers.validateCPF(cpf)) throw new InvalidIdentifierError('Invalid CPF');
    const cpfWalletOnDb = await this.walletsRepository.findByCpfCnpj(cpf);
    if (cpfWalletOnDb) throw new WalletAccountExistsError();

    return cpf;
  }

  private async validateCnpj(cnpj: string) {
    if (cnpj) {
      if (!Identifiers.validateCNPJ(cnpj)) throw new InvalidIdentifierError('Invalid CNPJ');
      const cnpjWalletOnDb = await this.walletsRepository.findByCpfCnpj(cnpj);
      if (cnpjWalletOnDb) throw new WalletAccountExistsError();

      return cnpj;
    }
    return;
  }

  private async validateEmail(email: string) {
    const emailWalletOnDb = await this.walletsRepository.findByEmail(email);
    if (emailWalletOnDb) throw new EmailAlreadyExistsError();

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
