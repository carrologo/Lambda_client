// application/use-cases/GetClientById.ts
import { Client } from "../../domain/entities/Client";
import { ClientRepository } from "../../domain/repositories/ClientRepository";

export class GetClientById {
  constructor(private clientRepository: ClientRepository) {}

  async execute(id: string): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
        throw new Error(`Client with ID ${id} not found`);
    }
    return client;
  }
}