"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const SupabaseClientRepository_1 = require("../database/SupabaseClientRepository");
const CreateClient_1 = require("../../application/use-cases/CreateClient");
const clientRepository = new SupabaseClientRepository_1.SupabaseClientRepository();
const createClient = new CreateClient_1.CreateClient(clientRepository);
const handler = async (event) => {
    try {
        const body = JSON.parse(event.body || "{}");
        const { name, email } = body;
        if (!name || !email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Name and email are required" }),
            };
        }
        const client = await createClient.execute(name, email);
        return {
            statusCode: 201,
            body: JSON.stringify(client),
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error instanceof Error ? error.message : "An unknown error occurred" }),
        };
    }
};
exports.handler = handler;
