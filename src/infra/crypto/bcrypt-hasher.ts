import { compare, hash } from 'bcryptjs';

import { HashComparer } from '@/domain/application/gateways/crypto/hash-comparer';
import { HashGenerator } from '@/domain/application/gateways/crypto/hash-generator';

export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = 8;

  async hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH);
  }
  async compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash);
  }
}
