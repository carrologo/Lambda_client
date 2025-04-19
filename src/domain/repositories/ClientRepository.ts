import { Client } from "../entities/Client";

export interface ClientRepository {
  save(client: Client): Promise<Client>;

  findByIdentification(identification: string): Promise<Client | null>;
}
