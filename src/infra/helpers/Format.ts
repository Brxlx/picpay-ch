export class Format {
  /**
   * Receives the amount in number and convert to region formated currency string
   * @param {string} amount to convert to currency
   * @returns {string} Formated currency value
   */
  public static formatToCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }
}
