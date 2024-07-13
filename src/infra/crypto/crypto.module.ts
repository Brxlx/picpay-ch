import { HashComparer } from '@/domain/application/gateways/crypto/hash-comparer';
import { Module } from '@nestjs/common';
import { BcryptHasher } from './bcrypt-hasher';
import { HashGenerator } from '@/domain/application/gateways/crypto/hash-generator';

@Module({
  providers: [
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [HashComparer, HashGenerator],
})
export class CryptoModule {}
