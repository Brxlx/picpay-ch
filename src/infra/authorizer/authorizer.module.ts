import { Module } from '@nestjs/common';
import { PicPayAuthorizer } from './picpay-authorizer';
import { Authorizer } from 'test/http/fake-authorizer';

@Module({
  providers: [{ provide: Authorizer, useClass: PicPayAuthorizer }],
  exports: [Authorizer],
})
export class AuthorizerModule {}
