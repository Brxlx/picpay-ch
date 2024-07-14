import { Module } from '@nestjs/common';
import { PicPayAuthorizer } from './picpay-authorizer';
import { Authorizer } from '@/domain/application/gateways/authorizer/authorize';

@Module({
  providers: [{ provide: Authorizer, useClass: PicPayAuthorizer }],
  exports: [Authorizer],
})
export class AuthorizerModule {}
