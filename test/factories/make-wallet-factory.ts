import { faker } from '@faker-js/faker/locale/pt_BR';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Wallet, WalletProps } from '@/domain/enterprise/entities/wallet';
import { WALLET_TYPE } from '@/core/types/wallet-type';

export async function makeWallet(
  override: Partial<WalletProps> = {},
  id?: UniqueEntityID,
) {
  return Wallet.create(
    {
      fullName: faker.person.fullName(),
      email: faker.internet.email().toLocaleLowerCase(),
      cpfCnpj: faker.string.numeric(),
      balance: Number(faker.finance.amount({ dec: 2, autoFormat: true })),
      walletType: WALLET_TYPE.USER,
      password: faker.internet.password({ length: 8 }),
      ...override,
    },
    id,
  );
}
