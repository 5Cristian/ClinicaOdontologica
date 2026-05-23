export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors: unknown[];

  constructor(mensaje: string, statusCode = 400, errors: unknown[] = []) {
    super(mensaje);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
