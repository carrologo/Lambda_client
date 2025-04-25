import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Client Management API',
      version: '1.0.0',
      description: 'API for managing client information',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Client: {
          type: 'object',
          required: ['name', 'lastName', 'email', 'identification', 'birthdate', 'contact', 'comment'],
          properties: {
            name: {
              type: 'string',
              description: 'Client\'s first name',
            },
            lastName: {
              type: 'string',
              description: 'Client\'s last name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Client\'s email address',
            },
            identification: {
              type: 'string',
              description: 'Client\'s identification number',
            },
            birthdate: {
              type: 'string',
              format: 'date',
              description: 'Client\'s birth date',
            },
            contact: {
              type: 'string',
              description: 'Client\'s contact number',
            },
            comment: {
              type: 'string',
              description: 'Additional comments about the client',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./src/infrastructure/lambdas/handler.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options); 