import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface TransactionProps {
  sender: UniqueEntityID;
  receiver: UniqueEntityID;
  amount: number;
  createdAt: Date;
}

export class Transaction extends Entity<TransactionProps> {
  get sender() {
    return this.props.sender;
  }

  get receiver() {
    return this.props.receiver;
  }

  get amount() {
    return this.props.amount;
  }

  static create(
    props: Optional<TransactionProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new Transaction(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
