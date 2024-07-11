import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';
import { WalletType } from './wallet-type';

export interface WalletProps {
  fullName: string;
  cpfCnpj: string;
  email: string;
  password: string;
  balance: number;
  walletType: WalletType['props']['description'];
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Wallet extends Entity<WalletProps> {
  get fullName() {
    return this.props.fullName;
  }

  get cpfCnpj() {
    return this.props.cpfCnpj;
  }

  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }

  set password(password: string) {
    this.props.password = this.format(password);
  }

  get balance() {
    return this.props.balance;
  }

  set balance(balance: number) {
    this.balance = balance;
    this.touch();
  }

  get walletType() {
    return this.props.walletType;
  }

  private format(value: string) {
    return value.toLocaleLowerCase();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<WalletProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new Wallet(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
