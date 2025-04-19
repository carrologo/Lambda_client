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
      .insert({ name: client.name, email: client.email, identification: client.identification, birth_date: client.birthdate, contact: client.contact })
      .select()
      .single();

    if (error) {
     console.error("Error inserting client:", error);
      throw new Error(error.message);
    }

    return new Client( data.name, data.email, data.identification, data.birthdate, data.contact );
  }
  async findByIdentification(identification: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from("client")
      .select("*")
      .eq("identification", identification)
      .single();
  
    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching client:", error);
      throw new Error(error.message);
    }
  
    return data ? new Client(data.name, data.email, data.identification, data.birthdate, data.contact) : null;
  }
}