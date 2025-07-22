import { Client } from "../../domain/entities/Client";
import { ClientRepository } from "../../domain/repositories/ClientRepository";
import { ClientAlreadyExistsError } from "../../domain/entities/ClientAlreadyExitsError";
import { ClientEmailAlreadyExistsError } from "../../domain/entities/ClientEmailAlreadyExistsError";

export class CreateClient {
  constructor(private clientRepository: ClientRepository) {}

  async execute(name: string, lastName: string, email: string, identification: string, birthdate: Date, contact:  string, comment: string): Promise<Client> {
    try {
      const client = new Client( name, lastName, email, identification, birthdate, contact, comment);

      const existingClient = await this.clientRepository.findByIdentification(identification);

      if (existingClient) {
        throw new ClientAlreadyExistsError(identification);
      }

      const existingClientByEmail = await this.clientRepository.findByEmail(email);

      if (existingClientByEmail) {
        throw new ClientEmailAlreadyExistsError(email);
      }

      return await this.clientRepository.save(client);
    } catch (error) {
      if (error instanceof ClientAlreadyExistsError || error instanceof ClientEmailAlreadyExistsError) {
        throw error;
      }
      throw new Error(`Failed to create client: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}