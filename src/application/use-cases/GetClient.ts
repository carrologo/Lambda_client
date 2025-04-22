// application/use-cases/GetClientById.ts
import { Client } from "../../domain/entities/Client";
import { ClientNotFoundError } from "../../domain/entities/ClientNotFoundError";
import { ClientRepository } from "../../domain/repositories/ClientRepository";

export class GetClientById {
  constructor(private clientRepository: ClientRepository) {}

  async execute(id: string): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new ClientNotFoundError(id);
    }
    return client;
  }
}