import { Module } from '@nestjs/common';

import { Authorizer } from '@/domain/application/gateways/authorizer/authorize';

import { PicPayAuthorizer } from './picpay-authorizer';

@Module({
  providers: [{ provide: Authorizer, useClass: PicPayAuthorizer }],
  exports: [Authorizer],
})
export class AuthorizerModule {}
