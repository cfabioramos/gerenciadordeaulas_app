/* eslint-disable no-console */
/**
 * Logger centralizado da aplicação.
 * Permite desligar logs em produção e mantém o restante do código limpo.
 */
export class AppLogger {
  static error(...args: unknown[]): void {
    console.error(...args);
  }

  static warn(...args: unknown[]): void {
    console.warn(...args);
  }

  static log(...args: unknown[]): void {
    console.log(...args);
  }

  static info(...args: unknown[]): void {
    console.info(...args);
  }
}