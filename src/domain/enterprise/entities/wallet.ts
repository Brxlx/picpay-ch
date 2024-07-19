import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';
import { WalletType } from './wallet-type';
import { WALLET_TYPE } from '@/core/types/wallet-type';

export interface WalletProps {
  fullName: string;
  cpf: string;
  cnpj?: string;
  email: string;
  password: string;
  balance: number;
  walletType: WalletType['props']['description'];
  walletTypeId: UniqueEntityID;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Wallet extends Entity<WalletProps> {
  get fullName() {
    return this.props.fullName;
  }

  get cpf() {
    return this.props.cpf;
  }

  get cnpj() {
    return this.props.cnpj;
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

  get walletType() {
    return this.props.walletType;
  }

  get walletTypeId() {
    return this.props.walletTypeId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  public increaseBalance(amount: number) {
    this.props.balance += amount;
    this.touch();
  }

  public decreaseBalance(amount: number) {
    this.props.balance -= amount;
    this.touch();
  }

  private format(value: string) {
    return value.toLocaleLowerCase();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<WalletProps, 'walletType' | 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new Wallet(
      {
        ...props,
        walletType: props.cnpj ? WALLET_TYPE.MERCHANT : WALLET_TYPE.USER,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
