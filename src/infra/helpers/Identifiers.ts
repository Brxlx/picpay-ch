import { fake as generateCNPJ, validate as validateCNPJ } from 'validation-br/dist/cnpj';
import { fake as generateCPF, validate as validateCPF } from 'validation-br/dist/cpf';

export class Identifiers {
  /**
   * Gera um CPF válido com pontos e hífen (14 caracteres).
   *
   * @returns {string} CPF formatado.
   */
  static generateValidCPF(): string {
    return generateCPF(true);
  }

  /**
   * Verifica se um CPF informado é válido.
   *
   * @param {string} cpf CPF a ser validado.
   * @returns {boolean} True se o CPF for válido, False caso contrário.
   */
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
