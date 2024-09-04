import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { EnvModule } from './env/env.module';
import { GlobalExceptionFilter } from './http/filters/global-http.filter';
import { HttpModule } from './http/http.module';

@Module({
  imports: [EnvModule, HttpModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
