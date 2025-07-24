import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mini Coder Backend API',
      version: '1.0.0',
      description: 'A simple Express API with TypeScript, PostgreSQL, and Prisma',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env['PORT'] || 3001}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['email'],
          properties: {
            id: {
              type: 'integer',
              description: 'The auto-generated id of the user',
            },
            email: {
              type: 'string',
              description: 'The user email',
            },
            name: {
              type: 'string',
              description: 'The user name',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date the user was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date the user was last updated',
            },
          },
        },
        Post: {
          type: 'object',
          required: ['title'],
          properties: {
            id: {
              type: 'integer',
              description: 'The auto-generated id of the post',
            },
            title: {
              type: 'string',
              description: 'The post title',
            },
            content: {
              type: 'string',
              description: 'The post content',
            },
            published: {
              type: 'boolean',
              description: 'Whether the post is published',
            },
            authorId: {
              type: 'integer',
              description: 'The id of the post author',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date the post was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date the post was last updated',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const specs = swaggerJsdoc(options);
