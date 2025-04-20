import { ClientRepository } from "../../domain/repositories/ClientRepository";
import { Client } from "../../domain/entities/Client";

export class GetAllClients {
  constructor(private clientRepository: ClientRepository) {}

  async execute(): Promise<Client[]> {
    return this.clientRepository.findAll();
  }
}