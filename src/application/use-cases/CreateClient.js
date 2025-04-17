"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClient = void 0;
const Client_1 = require("../../domain/entities/Client");
class CreateClient {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    async execute(name, email) {
        try {
            const client = new Client_1.Client(name, email);
            return await this.clientRepository.save(client);
        }
        catch (error) {
            throw new Error(`Failed to create client: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
exports.CreateClient = CreateClient;
