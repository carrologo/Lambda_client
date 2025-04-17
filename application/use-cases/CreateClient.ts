import { Client } from "../../domain/entities/Client";
import { ClientRepository } from "../../domain/repositories/ClientRepository";

export class CreateClient {
  constructor(private clientRepository: ClientRepository) {}

  async execute(name: string, email: string): Promise<Client> {
    try {
      const client = new Client( name, email);
      
      return await this.clientRepository.save(client);
    } catch (error) {
      throw new Error(`Failed to create client: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}