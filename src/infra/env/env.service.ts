import { ConfigService } from '@nestjs/config';
import { Env } from './env-schema';
import { Injectable } from '@nestjs/common';
import { CoreEnv } from '@/core/env/env';

@Injectable()
export class EnvService implements CoreEnv<Env> {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  public get<T extends keyof Env>(key: T) {
    return this.configService.get(key, { infer: true });
  }
}
