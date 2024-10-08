import { Prisma, WalletType as PrismaWalletsType } from '@prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { WALLET_TYPE } from '@/core/types/wallet-type';
import { WalletType } from '@/domain/enterprise/entities/wallet-type';

export class PrismaWalletsTypeMapper {
  static toDomain(raw: PrismaWalletsType): WalletType {
    return WalletType.create(
      {
        description: raw.description as WALLET_TYPE,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(walletstype: WalletType): Prisma.WalletTypeUncheckedCreateInput {
    return {
      id: walletstype.id.toString(),
      description: walletstype.description,
    };
  }
}
