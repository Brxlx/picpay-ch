import { Module } from '@nestjs/common';
import { EnvService } from './envService';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env-schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
      cache: true,
    }),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
