import { APIGatewayProxyHandler } from "aws-lambda";
import { SupabaseClientRepository } from "../database/SupabaseClientRepository";
import { CreateClient } from "../../application/use-cases/CreateClient";

const clientRepository = new SupabaseClientRepository();
const createClient = new CreateClient(clientRepository);

export const handler: APIGatewayProxyHandler = async (event) => {
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
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error instanceof Error ? error.message : "An unknown error occurred" }),
    };
  }
};