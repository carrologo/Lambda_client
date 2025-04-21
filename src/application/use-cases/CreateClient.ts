import { Client } from "../../domain/entities/Client";
import { ClientRepository } from "../../domain/repositories/ClientRepository";
import { ClientAlreadyExistsError } from "../../domain/entities/ClientAlreadyExitsError";

export class CreateClient {
  constructor(private clientRepository: ClientRepository) {}

  async execute(name: string, email: string, identification: string, birthdate: Date, contact:  number, comment: string): Promise<Client> {
    try {
      const client = new Client( name, email, identification, birthdate, contact, comment);

      const existingClient = await this.clientRepository.findByIdentification(identification);

      if (existingClient) {
        throw new ClientAlreadyExistsError();
      }

      return await this.clientRepository.save(client);
    } catch (error) {
      throw new Error(`Failed to create client: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}