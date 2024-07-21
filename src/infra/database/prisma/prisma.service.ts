import { EnvService } from '@/infra/env/env.service';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  constructor(private readonly envService: EnvService) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
        {
          emit: 'event',
          level: 'error',
        },
      ],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();

    if (this.envService.get('NODE_ENV') === 'prod') return;

    this.$on('query', (event) => {
      const magenta = '\u001b[35m';
      this.logger.log(
        `Query: ${magenta} ${event.query}`,
        `Params: ${magenta} ${event.query}`,
        `Duration: ${magenta} ${event.duration} ms`,
        '---------------------------------',
      );
    });

    this.$on('info', (event) => {
      this.logger.log(`INFO: ${event.message}`);
    });

    this.$on('warn', (event) => {
      this.logger.log(`WARN: ${event.message}`);
    });

    this.$on('error', (event) => {
      this.logger.log(`ERROR: ${event.message}`);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
