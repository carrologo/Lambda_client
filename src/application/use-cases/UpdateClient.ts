import { ClientRepository } from "../../domain/repositories/ClientRepository";
import { Client } from "../../domain/entities/Client";
import { ClientNotFoundError } from "../../domain/entities/ClientNotFoundError";

export class UpdateClient {
  constructor(private clientRepository: ClientRepository) {}

  async execute(id: string, updates: Partial<Client>): Promise<Client> {
    const existingClient = await this.clientRepository.findById(id);

    if (!existingClient) {
      throw new ClientNotFoundError(id);
    }

    return this.clientRepository.updatePartial(id, updates);
  }
}
