import { Module } from '@nestjs/common';

import { HashComparer } from '@/domain/application/gateways/crypto/hash-comparer';
import { HashGenerator } from '@/domain/application/gateways/crypto/hash-generator';

import { BcryptHasher } from './bcrypt-hasher';

@Module({
  providers: [
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [HashComparer, HashGenerator],
})
export class CryptoModule {}
