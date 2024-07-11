import { Wallet } from '@/domain/enterprise/entities/wallet';

export abstract class WalletsRepository {
  abstract findById(id: string): Promise<Wallet | null>;
  abstract findByEmail(email: string): Promise<Wallet | null>;
  abstract findByCpfCnpj(cpfcnpf: string): Promise<Wallet | null>;
  abstract create(wallet: Wallet): Promise<void>;
}
