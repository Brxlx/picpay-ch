import { faker } from '@faker-js/faker/locale/pt_BR';
import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Wallet, WalletProps } from '@/domain/enterprise/entities/wallet';
import { PrismaWalletMapper } from '@/infra/database/prisma/mappers/prisma-wallet.mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Identifiers } from '@/infra/helpers/Identifiers';

export async function makeWallet(
  override: Partial<Omit<WalletProps, 'walletType'>> = {},
  id?: UniqueEntityID,
) {
  return Wallet.create(
    {
      fullName: faker.person.fullName(),
      email: faker.internet.email().toLocaleLowerCase(),
      cpf: override.cpf ?? Identifiers.generateValidCPF(),
      cnpj: override.cnpj,
      walletTypeId: override.cnpj ? new UniqueEntityID('MERCHANT') : new UniqueEntityID('USER'),
      balance: faker.number.float({ fractionDigits: 2, min: 0, max: 3000 }),
      password: faker.internet.password({ length: 8 }),
      ...override,
    },
    id,
  );
}

@Injectable()
export class WalletFactory {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureWalletTypes() {
    await this.prisma.walletType.createMany({
      data: [
        { id: 'USER', description: 'USER' },
        { id: 'MERCHANT', description: 'MERCHANT' },
      ],
      skipDuplicates: true,
    });
  }

  public async makePrismaWallet(data: Partial<WalletProps> = {}, id?: UniqueEntityID) {
    // ensure wallet types is created and have no duplicates
    await this.ensureWalletTypes();

    const wallet = await makeWallet(data, id);

    await this.prisma.wallet.create({
      data: PrismaWalletMapper.toPrisma(wallet),
    });

    return wallet;
  }
}
