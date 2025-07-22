export class ClientNotFoundError extends Error {
  constructor(id: string) {
    super(`Cliente con ID ${id} no encontrado`);
    this.name = "ClientNotFoundError";
  }
}
