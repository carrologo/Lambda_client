export class ClientEmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`El cliente con el correo ${email} ya existe.`);
    this.name = "ClientEmailAlreadyExistsError";
  }
}
