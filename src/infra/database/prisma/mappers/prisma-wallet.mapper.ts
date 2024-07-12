import { Prisma, Wallet as PrismaWallet } from '@prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Wallet } from '@/domain/enterprise/entities/wallet';

export class PrismaWalletMapper {
  static toDomain(raw: PrismaWallet): Wallet {
    return Wallet.create(
      {
        fullName: raw.fullName,
        email: raw.email,
        cpf: raw.cpf,
        cnpj: raw.cnpj ?? undefined,
        balance: Number(raw.balance),
        password: raw.password,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(wallet: Wallet): Prisma.WalletUncheckedCreateInput {
    return {
      id: wallet.id.toString(),
      fullName: wallet.fullName,
      email: wallet.email,
      password: wallet.password,
      cpf: wallet.cpf,
      cnpj: wallet.cnpj,
      balance: wallet.balance,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt ?? undefined,
    };
  }
}
