import { ClientRepository } from "../../domain/repositories/ClientRepository";
import { Client } from "../../domain/entities/Client";

export class GetAllClients {
  constructor(private clientRepository: ClientRepository) {}

  async execute(queryParams: { name?: string; page?: number; limit?: number }): Promise<{
    data: Client[];
    pagination: {
      page: number;
      total: number;
    };
  }> {
    const { clients, pagination } = await this.clientRepository.findAll(queryParams);
    
    return {
      data: clients,
      pagination,
    };
  }
}