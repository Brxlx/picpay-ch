import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface TransacationProps {
  sender: UniqueEntityID;
  receiver: UniqueEntityID;
  amount: number;
  createdAt: Date;
}

export class Transacation extends Entity<TransacationProps> {
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
    props: Optional<TransacationProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new Transacation(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
