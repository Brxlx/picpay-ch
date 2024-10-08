import { WALLET_TYPE } from '@/core/types/wallet-type';
import { WalletType } from '@/domain/enterprise/entities/wallet-type';

export abstract class WalletsTypeRepository {
  abstract findByDescription(description: WALLET_TYPE): Promise<WalletType | null>;
}
