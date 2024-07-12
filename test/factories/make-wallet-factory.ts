import { faker } from '@faker-js/faker/locale/pt_BR';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Wallet, WalletProps } from '@/domain/enterprise/entities/wallet';
import { Identifiers } from '@/infra/helpers/Identifiers';

export async function makeWallet(
  override: Partial<WalletProps> = {},
  id?: UniqueEntityID,
) {
  return Wallet.create(
    {
      fullName: faker.person.fullName(),
      email: faker.internet.email().toLocaleLowerCase(),
      cpf: override.cpf ?? Identifiers.generateValidCPF(),
      cnpj: override.cnpj,
      balance: faker.number.float({ fractionDigits: 2, min: 0, max: 3000 }),
      password: faker.internet.password({ length: 8 }),
      ...override,
    },
    id,
  );
}
