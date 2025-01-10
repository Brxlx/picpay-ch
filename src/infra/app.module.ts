import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { EnvModule } from './env/env.module';
import { GlobalExceptionFilter } from './http/filters/global-http.filter';
import { UseCaseErrorFilter } from './http/filters/use-case-error.filter';
import { HttpModule } from './http/http.module';

@Module({
  imports: [EnvModule, HttpModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: UseCaseErrorFilter,
    },
  ],
})
export class AppModule {}
