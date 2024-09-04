import { patchNestjsSwagger } from '@anatine/zod-nestjs';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { EnvService } from './env/env.service';

async function bootstrap() {
  const logger = new Logger();

  const app = await NestFactory.create(AppModule);
  const envService = app.get(EnvService);

  const port = envService.get('APP_PORT');

  patchNestjsSwagger(); // <--- This is the hacky patch using prototypes (for now)

  const config = new DocumentBuilder()
    .setTitle('PicPay')
    .setDescription('The Picpay simplified transaction')
    .setVersion('1.0')
    .addTag('Picpay')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port, () => {
    logger.log('App up and running!');
  });
}
bootstrap();
