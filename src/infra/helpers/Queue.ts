/**
 * Utilitário para simular delays em operações assíncronas
 * Útil para testes de comportamento não-bloqueante e processamento paralelo
 */
export class QueueDelayHelper {
  /**
   * Cria um delay artificial com tempo configurável
   * @param ms Tempo em millisegundos para o delay
   * @param operation Nome da operação (para logging)
   * @returns Promise que resolve após o tempo especificado
   */
  static async delay(ms: number, operation: string): Promise<void> {
    console.log(`[${new Date().toISOString()}] Iniciando ${operation}`);

    await new Promise((resolve) => setTimeout(resolve, ms));

    console.log(`[${new Date().toISOString()}] Finalizando ${operation}`);
  }

  /**
   * Gera um tempo de delay aleatório dentro de um intervalo
   * @param min Tempo mínimo em ms
   * @param max Tempo máximo em ms
   * @returns Número aleatório entre min e max
   */
  static getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
