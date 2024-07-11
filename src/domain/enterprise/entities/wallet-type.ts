import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { WALLET_TYPE } from '@/core/types/wallet-type';

export interface WalletTypeProps {
  description: WALLET_TYPE;
}

export class WalletType extends Entity<WalletTypeProps> {
  get description() {
    return this.props.description;
  }

  set description(description: WALLET_TYPE) {
    this.description = description;
  }

  static create(props: WalletTypeProps, id?: UniqueEntityID) {
    return new WalletType(
      {
        ...props,
      },
      id,
    );
  }
}
