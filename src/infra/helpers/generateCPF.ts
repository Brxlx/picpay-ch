import { faker } from '@faker-js/faker/locale/pt_BR';

export function generateValidCPF(): string {
  // Generate random digits
  const baseCPF = faker.string.numeric(9);

  // Calculate verification digits
  const firstDigit =
    (parseInt(baseCPF[0]) * 10 +
      parseInt(baseCPF[1]) * 9 +
      parseInt(baseCPF[2]) * 8 +
      parseInt(baseCPF[3]) * 7 +
      parseInt(baseCPF[4]) * 6 +
      parseInt(baseCPF[5]) * 5 +
      parseInt(baseCPF[6]) * 4 +
      parseInt(baseCPF[7]) * 3 +
      parseInt(baseCPF[8]) * 2) %
    11;
  const secondDigit =
    (parseInt(baseCPF[0]) * 11 +
      parseInt(baseCPF[1]) * 10 +
      parseInt(baseCPF[2]) * 9 +
      parseInt(baseCPF[3]) * 8 +
      parseInt(baseCPF[4]) * 7 +
      parseInt(baseCPF[5]) * 6 +
      parseInt(baseCPF[6]) * 5 +
      parseInt(baseCPF[7]) * 4 +
      parseInt(baseCPF[8]) * 3 +
      firstDigit * 2) %
    11;

  // Correct verification digits if needed
  const finalFirstDigit =
    firstDigit === 10 || firstDigit === 11 ? 0 : firstDigit;
  const finalSecondDigit =
    secondDigit === 10 || secondDigit === 11 ? 0 : secondDigit;

  // Format CPF with dashes and period
  return `${baseCPF.slice(0, 3)}.${baseCPF.slice(3, 6)}.${baseCPF.slice(6, 9)}-${finalFirstDigit}${finalSecondDigit}`;
}
