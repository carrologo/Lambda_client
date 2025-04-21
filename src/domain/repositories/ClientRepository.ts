import { Client } from "../entities/Client";

export interface ClientRepository {
  save(client: Client): Promise<Client>;

  findByIdentification(identification: string): Promise<Client | null>;

  
  findAll(queryParams: { findBy?: string; value?: any; orderBy?: string; isAsc: boolean; page?: number; limit?: number }): Promise<{
    clients: Client[];
    pagination: {
      page: number;
      total: number;
    };
  }>;

  updatePartial(id: string, updates: Partial<Client>): Promise<Client>;

  findById(id: string): Promise<Client | null>;
}
