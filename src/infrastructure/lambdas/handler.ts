import { APIGatewayProxyHandler } from "aws-lambda";
import { SupabaseClientRepository } from "../database/SupabaseClientRepository";
import { CreateClient } from "../../application/use-cases/CreateClient";
import { ClientAlreadyExistsError } from "../../domain/entities/ClientAlreadyExitsError";

const clientRepository = new SupabaseClientRepository();
const createClient = new CreateClient(clientRepository);

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { name, email, identification, birthdate, contact } = body;

    const missingFields: string[] = [];

    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!identification) missingFields.push("identification");
    if (!birthdate) missingFields.push("birthdate");
    if (!contact) missingFields.push("contact");

    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Missing required field(s): ${missingFields.join(", ")}`,
        }),
      };
    }

    const client = await createClient.execute(
      name,
      email,
      identification,
      birthdate,
      contact
    );

    return {
      statusCode: 201,
      body: JSON.stringify(client),
    };
  } catch (error) {
    if (error instanceof ClientAlreadyExistsError) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: error.message }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message:
          error instanceof Error
            ? error.message
            : "An unknown error occurred",
      }),
    };
  }
};
