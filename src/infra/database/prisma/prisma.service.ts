import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { format } from 'sql-formatter';

import { EnvService } from '@/infra/env/env.service';

/**
 * Interface para armazenar o histórico de queries
 */
interface QueryHistoryItem {
  query: string;
  timestamp: number;
}

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  // Armazena o histórico de queries recentes para evitar duplicação
  private queryHistory: QueryHistoryItem[] = [];

  // Tempo em ms para considerar uma query como duplicada
  private readonly QUERY_DEDUPLICATION_WINDOW = 100;

  // Cores ANSI para melhorar a legibilidade dos logs
  private readonly colors = {
    magenta: '\u001b[35m',
    cyan: '\u001b[36m',
    yellow: '\u001b[33m',
    green: '\u001b[32m',
    red: '\u001b[31m',
    reset: '\u001b[0m',
    bold: '\u001b[1m',
  };

  constructor(private readonly envService: EnvService) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Só habilita logs em ambientes de desenvolvimento
    if (this.envService.get('NODE_ENV') !== 'dev' && this.envService.get('NODE_ENV') !== 'test') {
      return;
    }

    this.$on('query', (event) => {
      // Verifica se a query é duplicada dentro da janela de tempo
      if (this.isDuplicatedQuery(event.query)) {
        return;
      }

      // Formata a query SQL para melhor legibilidade
      let formattedQuery: string;
      try {
        formattedQuery = format(event.query, {
          language: 'postgresql', // Ajuste para o seu banco se necessário
          tabWidth: 2, // Usa tabWidth em vez de indent
          keywordCase: 'upper', // Coloca keywords em maiúsculo para melhor visibilidade
        });
      } catch {
        // Em caso de erro na formatação, usa a query original
        formattedQuery = event.query;
      }

      // Formata os parâmetros como JSON para melhor legibilidade
      let formattedParams = '{}';
      try {
        formattedParams = event.params ? JSON.stringify(JSON.parse(event.params), null, 2) : '{}';
      } catch {
        // Em caso de erro na formatação dos parâmetros, usa o formato original
        formattedParams = event.params || '{}';
      }

      // Cria um log mais estruturado e visualmente claro
      this.logger.log(
        `\n${this.colors.bold}${this.colors.magenta}PRISMA QUERY${this.colors.reset}\n` +
          `${this.colors.cyan}┌─ Duration:${this.colors.reset} ${event.duration}ms\n` +
          `${this.colors.cyan}├─ Timestamp:${this.colors.reset} ${new Date().toISOString()}\n` +
          `${this.colors.cyan}├─ Query:${this.colors.reset}\n${formattedQuery}\n` +
          `${this.colors.cyan}└─ Params:${this.colors.reset}\n${formattedParams}\n`,
      );

      // Adiciona ao histórico para deduplicação
      this.addToQueryHistory(event.query);
    });

    this.$on('info', (event) => {
      this.logger.log(`${this.colors.green}INFO:${this.colors.reset} ${event.message}`);
    });

    this.$on('warn', (event) => {
      this.logger.log(`${this.colors.yellow}WARN:${this.colors.reset} ${event.message}`);
    });

    this.$on('error', (event) => {
      this.logger.log(`${this.colors.red}ERROR:${this.colors.reset} ${event.message}`);
    });
  }

  /**
   * Verifica se uma query foi executada recentemente para evitar logs duplicados
   * @param query A consulta SQL a ser verificada
   * @returns true se a query for considerada duplicada
   */
  private isDuplicatedQuery(query: string): boolean {
    const now = Date.now();

    // Limpa entradas antigas do histórico
    this.queryHistory = this.queryHistory.filter(
      (item) => now - item.timestamp < this.QUERY_DEDUPLICATION_WINDOW,
    );

    // Verifica se a query existe no histórico recente
    return this.queryHistory.some((item) => item.query === query);
  }

  /**
   * Adiciona uma query ao histórico para controle de deduplicação
   * @param query A consulta SQL a ser adicionada ao histórico
   */
  private addToQueryHistory(query: string): void {
    this.queryHistory.push({
      query,
      timestamp: Date.now(),
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
