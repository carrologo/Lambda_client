import { APIGatewayProxyHandler } from "aws-lambda";
import { SupabaseClientRepository } from "../database/SupabaseClientRepository";
import { CreateClient } from "../../application/use-cases/CreateClient";
import { GetAllClients } from "../../application/use-cases/GetAllClients";
import { ClientAlreadyExistsError } from "../../domain/entities/ClientAlreadyExitsError";
import { UpdateClient } from "../../application/use-cases/UpdateClient";
import { GetClientById } from "../../application/use-cases/GetClient";
import { ClientNotFoundError } from "../../domain/entities/ClientNotFoundError";

const clientRepository = new SupabaseClientRepository();
const createClient = new CreateClient(clientRepository);
const getAllClients = new GetAllClients(clientRepository);
const updateClient = new UpdateClient(clientRepository);
const getClientById = new GetClientById(clientRepository);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Client with this identification already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

    /**
     * @swagger
     * /clients:
     *   get:
     *     summary: Get all clients with optional filtering and pagination
     *     tags: [Clients]
     *     parameters:
     *       - in: query
     *         name: findBy
     *         schema:
     *           type: string
     *         description: Field to search by
     *       - in: query
     *         name: value
     *         schema:
     *           type: string
     *         description: Value to search for
     *       - in: query
     *         name: orderBy
     *         schema:
     *           type: string
     *         description: Field to order by
     *       - in: query
     *         name: isAsc
     *         schema:
     *           type: boolean
     *         description: Sort in ascending order
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Number of items per page
     *     responses:
     *       200:
     *         description: List of clients
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Client'
     *                 pagination:
     *                   type: object
     *                   properties:
     *                     page:
     *                       type: integer
     *                     total:
     *                       type: integer
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
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

    /**
     * @swagger
     * /clients/{id}:
     *   patch:
     *     summary: Update a client's information
     *     tags: [Clients]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Client ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Client'
     *     responses:
     *       200:
     *         description: Client updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Client'
     *       404:
     *         description: Client not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
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

    /**
     * @swagger
     * /client/{id}:
     *   get:
     *     summary: Get a client by ID
     *     tags: [Clients]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Client ID
     *     responses:
     *       200:
     *         description: Client found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Client'
     *       404:
     *         description: Client not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    if (event.httpMethod === "GET" && event.path.startsWith("/client/")) {
      const id = event.pathParameters?.id;
      if (!id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Client ID is required" }),
        };
      }
      try {
        const client = await getClientById.execute(id);
        return {
          statusCode: 200,
          body: JSON.stringify(client),
        };
      } catch (error) {
        if (error.message === "Client not found") {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: "Client not found" }),
          };
        }
        throw error; 
      }
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
    if (error instanceof ClientNotFoundError) {
      return {
        statusCode: 404,
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