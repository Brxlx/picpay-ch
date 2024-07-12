import {
  validate as validateCPF,
  fake as generateCPF,
} from 'validation-br/dist/cpf';
import {
  validate as validateCNPJ,
  fake as generateCNPJ,
} from 'validation-br/dist/cnpj';

export class Identifiers {
  static generateValidCPF(): string {
    return generateCPF(true);
  }

  static validateCPF(cpf: string): boolean {
    return validateCPF(cpf);
  }

  /**
   * Gera um CNPJ válido com pontos e barras (18 caracteres).
   *
   * @returns {string} CNPJ formatado.
   */
  static generateValidCNPJ(): string {
    return generateCNPJ(true);
  }

  /**
   * Verifica se um CNPJ informado é válido.
   *
   * @param {string} cnpj CNPJ a ser validado.
   * @returns {boolean} True se o CNPJ for válido, False caso contrário.
   */
  static validateCNPJ(cnpj: string): boolean {
    return validateCNPJ(cnpj);
  }
}
