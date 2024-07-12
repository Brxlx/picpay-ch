import { Identifiers } from '../src/infra/helpers/Identifiers';
import { PrismaClient } from '@prisma/client';
import { BcryptHasher } from '../src/infra/crypto/bcrypt-hasher';

const prisma = new PrismaClient();

async function createWalletType() {
  const findIfAlreadyCreatedWalletTypes = await prisma.walletType.findMany({
    where: {
      OR: [
        { description: { equals: 'USER' } },
        { description: { equals: 'MERCHANT' } },
      ],
    },
  });
  if (findIfAlreadyCreatedWalletTypes.length) {
    console.log('Wallet Types already exists');
    return;
  }
  console.log('Seeding db with wallet types');
  await prisma.walletType.createMany({
    data: [
      {
        description: 'USER',
      },
      {
        description: 'MERCHANT',
      },
    ],
  });
  console.log('Finished seeding wallet types');
}

async function createWallets() {
  const walletTypeUser = await prisma.walletType.findFirst({
    where: { description: 'USER' },
  });
  console.log(walletTypeUser);

  if (!walletTypeUser) return;

  console.log('Seeding db with wallets');

  const createwalletUser = prisma.wallet.create({
    data: {
      fullName: 'User User',
      email: 'user@email.com',
      password: await new BcryptHasher().hash('12345678'),
      cpf: Identifiers.generateValidCPF(),
      walletType: {
        connect: {
          id: walletTypeUser.id,
        },
      },
    },
  });

  const walletTypeMerchant = await prisma.walletType.findFirst({
    where: { description: 'MERCHANT' },
  });

  if (!walletTypeMerchant) {
    console.log('merchant not found');
    return;
  }

  const createWalletMerchant = prisma.wallet.create({
    data: {
      fullName: 'Merchant User',
      email: 'merchant@email.com',
      password: await new BcryptHasher().hash('12345678'),
      cpf: Identifiers.generateValidCPF(),
      cnpj: Identifiers.generateValidCNPJ(),
      walletType: {
        connect: {
          id: walletTypeMerchant.id,
        },
      },
    },
  });

  await prisma.$transaction([createwalletUser, createWalletMerchant]);
  console.log('Finished seeding db with wallets');
}

async function run() {
  await createWalletType();
  await createWallets();
}

run();
