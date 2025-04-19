export class ClientAlreadyExistsError extends Error {
    constructor(message: string = "Client with this identification already exists.") {
      super(message);
      this.name = "ClientAlreadyExistsError";
    }
  }