import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { EnvService } from './env/env.service';

async function bootstrap() {
  const logger = new Logger();

  const app = await NestFactory.create(AppModule);
  const envService = app.get(EnvService);

  const port = envService.get('APP_PORT');

  await app.listen(port, () => {
    logger.log('App up and running!');
  });
}
bootstrap();
