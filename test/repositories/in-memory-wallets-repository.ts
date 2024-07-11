import { WalletsRepository } from '@/domain/application/repositories/wallets-repository';
import { Wallet } from '@/domain/enterprise/entities/wallet';

export class InMemoryWalletsRepository implements WalletsRepository {
  public items: Wallet[] = [];

  async findById(id: string): Promise<Wallet | null> {
    const user = this.items.find((item) => item.id.toString() === id);

    if (!user) return null;

    return user;
  }
  async findByEmail(email: string): Promise<Wallet | null> {
    const user = this.items.find((item) => item.email === email);

    if (!user) return null;

    return user;
  }
  async findByCpfCnpj(cpfcnpf: string): Promise<Wallet | null> {
    const user = this.items.find((item) => item.cpfCnpj === cpfcnpf);

    if (!user) return null;

    return user;
  }
  async create(wallet: Wallet): Promise<void> {
    this.items.push(wallet);
  }
}
