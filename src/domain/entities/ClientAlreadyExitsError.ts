export class ClientAlreadyExistsError extends Error {
    constructor(identification: string) {
      super(`El cliente con la identificación ${identification} ya existe.`);
      this.name = "ClientAlreadyExistsError";
    }
  }