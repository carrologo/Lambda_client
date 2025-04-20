import { Client } from "../entities/Client";

export interface ClientRepository {
  save(client: Client): Promise<Client>;

  findByIdentification(identification: string): Promise<Client | null>;

  findAll(): Promise<Client[]>;

  updatePartial(id: string, updates: Partial<Client>): Promise<Client>;

  findById(id: string): Promise<Client | null>;
}
