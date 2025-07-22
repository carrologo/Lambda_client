import { ClientRepository } from "../../domain/repositories/ClientRepository";
import { Client } from "../../domain/entities/Client";
import { ClientNotFoundError } from "../../domain/entities/ClientNotFoundError";
import { ClientAlreadyExistsError } from "../../domain/entities/ClientAlreadyExitsError";
import { ClientEmailAlreadyExistsError } from "../../domain/entities/ClientEmailAlreadyExistsError";

export class UpdateClient {
  constructor(private clientRepository: ClientRepository) {}

  async execute(id: string, updates: Partial<Client>): Promise<Client> {
    try {
      const existingClient = await this.clientRepository.findById(id);

      if (!existingClient) {
        throw new ClientNotFoundError(id);
      }

      await this.validateUniqueFields(updates, existingClient);

      return await this.clientRepository.updatePartial(id, updates);
    } catch (error) {
      if (error instanceof ClientNotFoundError || 
          error instanceof ClientAlreadyExistsError || 
          error instanceof ClientEmailAlreadyExistsError) {
        throw error;
      }
      throw new Error(`Failed to update client: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async validateUniqueFields(updates: Partial<Client>, existingClient: Client): Promise<void> {
    if (this.shouldValidateField(updates.identification, existingClient.identification)) {
      await this.validateUniqueIdentification(updates.identification!);
    }

    if (this.shouldValidateField(updates.email, existingClient.email)) {
      await this.validateUniqueEmail(updates.email!);
    }
  }

  private shouldValidateField(newValue: string | undefined, currentValue: string): boolean {
    return newValue !== undefined && newValue !== currentValue;
  }

  private async validateUniqueIdentification(identification: string): Promise<void> {
    const clientWithSameIdentification = await this.clientRepository.findByIdentification(identification);
    
    if (clientWithSameIdentification) {
      throw new ClientAlreadyExistsError(identification);
    }
  }

  private async validateUniqueEmail(email: string): Promise<void> {
    const clientWithSameEmail = await this.clientRepository.findByEmail(email);
    
    if (clientWithSameEmail) {
      throw new ClientEmailAlreadyExistsError(email);
    }
  }
}
