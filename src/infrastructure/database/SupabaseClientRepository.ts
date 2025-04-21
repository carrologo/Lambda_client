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
      .insert({
        name: client.name,
        email: client.email,
        identification: client.identification,
        birth_date: client.birthdate,
        contact: client.contact,
        comment: client.comment,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting client:", error);
      throw new Error(error.message);
    }

    return new Client(
      data.name,
      data.email,
      data.identification,
      data.birthdate,
      data.contact,
      data.comment
    );
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

    return data
      ? new Client(
          data.name,
          data.email,
          data.identification,
          data.birthdate,
          data.contact,
          data.comment
        )
      : null;
  }

  async findAll(queryParams: {
    findBy?: string;
    value?: any;
    orderBy?: string;
    isAsc: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    clients: Client[];
    pagination: {
      page: number;
      total: number;
    };
  }> {
    const { findBy, value, orderBy, isAsc, page = 1, limit = 50 } = queryParams;

    let query = this.supabase.from("client").select("*", { count: "exact" });

    if (findBy && value) {
      query = query.ilike(findBy, `%${value}%`);
    }

    if (orderBy && orderBy !== "birthdate") {
      query = query.order(orderBy, { ascending: isAsc });
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching clients:", error);
      throw new Error("Failed to fetch clients");
    }

    let clients = data.map(
      (clientData: any) =>
        new Client(
          clientData.name,
          clientData.email,
          clientData.identification,
          clientData.birth_date,
          clientData.contact,
          clientData.comment,
          clientData.id
        )
    );

    if (orderBy === "birthdate") {
      clients = this.sortClientsByUpcomingBirthday(clients, isAsc);
    }

    return {
      clients,
      pagination: {
        page,
        total: count || 0,
      },
    };
  }

  async updatePartial(id: string, updates: Partial<Client>): Promise<Client> {
    const transformedUpdates: any = { ...updates };
    if (updates.birthdate) {
      transformedUpdates.birth_date = updates.birthdate;
      delete transformedUpdates.birthdate;
    }

    const { data, error } = await this.supabase
      .from("client")
      .update(transformedUpdates)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error updating client:", error);
      throw new Error("Failed to update client");
    }

    return updates as Client;
  }

  async findById(id: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from("client")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching client:", error);
      throw new Error(error.message);
    }

    return data
      ? new Client(
          data.name,
          data.email,
          data.identification,
          data.birthdate,
          data.contact,
          data.comment
        )
      : null;
  }

  private sortClientsByUpcomingBirthday(clients: Client[], isAscending: boolean): Client[] {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    return [...clients].sort((a, b) => {
      const birthdateA = new Date(a.birthdate);
      const birthdateB = new Date(b.birthdate);
      
      const monthA = birthdateA.getMonth() + 1;
      const dayA = birthdateA.getDate();
      
      const monthB = birthdateB.getMonth() + 1;
      const dayB = birthdateB.getDate();
      
      // Calcular días hasta el próximo cumpleaños para cada cliente
      const daysUntilA = this.calculateDaysUntilBirthday(monthA, dayA, currentMonth, currentDay);
      const daysUntilB = this.calculateDaysUntilBirthday(monthB, dayB, currentMonth, currentDay);
      
      // Ordenar según la dirección solicitada
      return isAscending ? daysUntilA - daysUntilB : daysUntilB - daysUntilA;
    });
  }
  
  // Calcula los días hasta el próximo cumpleaños
  private calculateDaysUntilBirthday(birthMonth: number, birthDay: number, currentMonth: number, currentDay: number): number {
    const currentYear = new Date().getFullYear();
    const birthdate = new Date(currentYear, birthMonth - 1, birthDay);
    const today = new Date(currentYear, currentMonth - 1, currentDay);
    
    // Si el cumpleaños ya pasó este año, ajustar al próximo año
    if (birthdate < today) {
      birthdate.setFullYear(currentYear + 1);
    }
    
    // Calcular diferencia en días
    const diffTime = birthdate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
