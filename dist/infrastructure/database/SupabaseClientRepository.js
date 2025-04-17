"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseClientRepository = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const Client_1 = require("../../domain/entities/Client");
class SupabaseClientRepository {
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");
    }
    async save(client) {
        const { data, error } = await this.supabase
            .from("client")
            .insert({ name: client.name, email: client.email })
            .select()
            .single();
        if (error) {
            console.error("Error inserting client:", error);
            throw new Error(error.message);
        }
        return new Client_1.Client(data.name, data.email);
    }
}
exports.SupabaseClientRepository = SupabaseClientRepository;
