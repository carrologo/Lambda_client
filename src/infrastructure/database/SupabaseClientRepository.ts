import { createClient } from "@supabase/supabase-js";
import { Client } from "../../domain/entities/Client";
import { ClientRepository } from "../../domain/repositories/ClientRepository";

export class SupabaseClientRepository implements ClientRepository {
  private supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_KEY || ""
  );

  async save(client: Client): Promise<Client> {
    const { data, error } = await this.supabase
      .from("client")
      .insert({ name: client.name, email: client.email })
      .select()
      .single();

    if (error) {
     console.error("Error inserting client:", error);
      throw new Error(error.message);
    }



    return new Client( data.name, data.email);
  }
}