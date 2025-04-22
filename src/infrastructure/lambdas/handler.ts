import { APIGatewayProxyHandler } from "aws-lambda";
import { SupabaseClientRepository } from "../database/SupabaseClientRepository";
import { CreateClient } from "../../application/use-cases/CreateClient";
import { GetAllClients } from "../../application/use-cases/GetAllClients";
import { ClientAlreadyExistsError } from "../../domain/entities/ClientAlreadyExitsError";
import { UpdateClient } from "../../application/use-cases/UpdateClient";


const clientRepository = new SupabaseClientRepository();
const createClient = new CreateClient(clientRepository);
const getAllClients = new GetAllClients(clientRepository);
const updateClient = new UpdateClient(clientRepository);

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (event.httpMethod === "POST" && event.path === "/clients") {
      const body = JSON.parse(event.body || "{}");
      const { name, lastName, email, identification, birthdate, contact, comment } = body;

      const missingFields: string[] = [];
      if (!name) missingFields.push("name");
      if (!lastName) missingFields.push("lastName");
      if (!email) missingFields.push("email");
      if (!identification) missingFields.push("identification");
      if (!birthdate) missingFields.push("birthdate");
      if (!contact) missingFields.push("contact");
      if (!comment) missingFields.push("comment");

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
        lastName,
        email,
        identification,
        birthdate,
        contact,
        comment,
      );

      return {
        statusCode: 201,
        body: JSON.stringify(client),
      };
    }

    if (event.httpMethod === "GET" && event.path === "/clients") {
      const queryParams = {
        findBy: event.queryStringParameters?.findBy,
        value: event.queryStringParameters?.value,
        orderBy: event.queryStringParameters?.orderBy,
        isAsc: event.queryStringParameters?.isAsc === "false"
          ? false
          : true,
        page: event.queryStringParameters?.page
          ? parseInt(event.queryStringParameters.page, 10)
          : 1,
        limit: event.queryStringParameters?.limit
          ? parseInt(event.queryStringParameters.limit, 10)
          : 50,
      };

      const { data, pagination } = await getAllClients.execute(queryParams);

      return {
        statusCode: 200,
        body: JSON.stringify({
          data,
          pagination,
        }),
      };
    }

    if (event.httpMethod === "PATCH" && event.path.startsWith("/clients/")) {
      const id = event.pathParameters?.id;
      if (!id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Client ID is required" }),
        };
      }

      const updates = JSON.parse(event.body || "{}");
      const updatedClient = await updateClient.execute(id, updates);

      return {
        statusCode: 200,
        body: JSON.stringify(updatedClient),
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Route not found" }),
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
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
    };
  }
};