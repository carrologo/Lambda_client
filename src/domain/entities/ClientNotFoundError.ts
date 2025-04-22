export class ClientNotFoundError extends Error {
  constructor(id: string) {
    super(`Client with ID ${id} not found`);
    this.name = "ClientNotFoundError";
  }
}
