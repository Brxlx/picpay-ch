import { Injectable } from '@nestjs/common';

import { WalletsRepository } from '@/domain/application/repositories/wallets-repository';
import { Wallet } from '@/domain/enterprise/entities/wallet';

import { PrismaWalletMapper } from '../mappers/prisma-wallet.mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaWalletsRepository implements WalletsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Wallet | null> {
    const wallet = await this.prisma.wallet.findUnique({ where: { id }, omit: { password: true } });
    if (!wallet) return null;

    return PrismaWalletMapper.toDomain({ ...wallet, password: '' });
  }
  async findByEmail(email: string): Promise<Wallet | null> {
    const wallet = await this.prisma.wallet.findUnique({ where: { email } });
    if (!wallet) return null;

    return PrismaWalletMapper.toDomain(wallet);
  }
  async findByCpfCnpj(cpfcnpf: string): Promise<Wallet | null> {
    const wallet = await this.prisma.wallet.findFirst({
      where: {
        OR: [
          {
            cpf: { equals: cpfcnpf },
          },
          {
            cnpj: { equals: cpfcnpf },
          },
        ],
      },
    });
    if (!wallet) return null;

    return PrismaWalletMapper.toDomain(wallet);
  }
  async create(wallet: Wallet): Promise<void> {
    await this.prisma.wallet.create({
      data: PrismaWalletMapper.toPrisma(wallet),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.wallet.delete({ where: { id } });
  }
}
