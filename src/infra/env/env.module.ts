import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CoreEnv } from '@/core/env/env';

import { EnvService } from './env.service';
import { envSchema } from './env-schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
      cache: true,
    }),
  ],
  providers: [{ provide: CoreEnv, useClass: EnvService }, EnvService],
  exports: [CoreEnv, EnvService],
})
export class EnvModule {}
