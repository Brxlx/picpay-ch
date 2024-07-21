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
    console.log('---Wallet Types already exists, skipping...---');
    return;
  }
  console.log('---Seeding db with wallet types---');
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
  console.log('---Finished seeding wallet types---');
}

async function createWallets() {
  const walletTypeUser = await prisma.walletType.findFirst({
    where: { description: 'USER' },
  });

  if (!walletTypeUser) {
    console.log('user not found');
    return;
  }

  console.log('---Seeding db with wallets---');

  const createwalletUser = prisma.wallet.create({
    data: {
      fullName: 'User User',
      email: 'user@email.com',
      password: await new BcryptHasher().hash('12345678'),
      cpf: Identifiers.generateValidCPF(),
      balance: 50,
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
      fullName: 'PicPay',
      email: 'picpay@email.com',
      password: await new BcryptHasher().hash('12345678'),
      cpf: Identifiers.generateValidCPF(),
      cnpj: Identifiers.generateValidCNPJ(),
      balance: 100,
      walletType: {
        connect: {
          id: walletTypeMerchant.id,
        },
      },
    },
  });
  try {
    await prisma.$transaction([createwalletUser, createWalletMerchant]);
    console.log('---Finished seeding db with wallets---');
  } catch (err: any) {
    if (err.code === 'P2002') {
      throw new Error('User or Merchant already exists');
    }
    throw new Error('Some constraint or DB error, check database');
  }
}

async function run() {
  await createWalletType();
  await createWallets();
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
