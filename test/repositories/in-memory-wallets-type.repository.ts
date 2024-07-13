import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { WALLET_TYPE } from '@/core/types/wallet-type';
import { WalletsTypeRepository } from '@/domain/application/repositories/wallets-type.repository';
import { WalletType } from '@/domain/enterprise/entities/wallet-type';

export class InMemoryWalletsTypeRepository implements WalletsTypeRepository {
  public items: WalletType[] = [];

  async findByDescription(
    description: WALLET_TYPE,
  ): Promise<WalletType | null> {
    const walletType = WalletType.create(
      { description: description },
      new UniqueEntityID(description),
    );
    console.log('AAAAAA', walletType);
    return walletType;
  }
}
