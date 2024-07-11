import { faker } from '@faker-js/faker/locale/pt_BR';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Wallet, WalletProps } from '@/domain/enterprise/entities/wallet';
import { WALLET_TYPE } from '@/core/types/wallet-type';
import { generateValidCPF } from '@/infra/helpers/generateCPF';

export async function makeWallet(
  override: Partial<WalletProps> = {},
  id?: UniqueEntityID,
) {
  return Wallet.create(
    {
      fullName: faker.person.fullName(),
      email: faker.internet.email().toLocaleLowerCase(),
      cpf: override.cpf ?? generateValidCPF(),
      cnpj: override.cnpj && faker.string.numeric({ length: 18 }),
      balance: faker.number.float({ fractionDigits: 2 }),
      walletType: WALLET_TYPE.USER,
      password: faker.internet.password({ length: 8 }),
      ...override,
    },
    id,
  );
}
