import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mini Coder Backend API",
      version: "1.0.0",
      description:
        "A simple Express API with TypeScript, PostgreSQL, and Prisma",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env["PORT"] || 3001}`,
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization",
      },
      {
        name: "Users",
        description: "User management operations",
      },
      {
        name: "Posts",
        description: "Post management operations",
      },
      {
        name: "Tokens",
        description: "Token balance and management",
      },
      {
        name: "Projects",
        description: "Project CRUD operations",
      },
      {
        name: "AI",
        description: "AI code generation services",
      },
      {
        name: "Admin",
        description: "Administrative operations (admin only)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["email"],
          properties: {
            id: {
              type: "integer",
              description: "The auto-generated id of the user",
            },
            email: {
              type: "string",
              description: "The user email",
            },
            name: {
              type: "string",
              description: "The user name",
            },
            tokens: {
              type: "integer",
              description: "The number of tokens the user has",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "The date the user was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "The date the user was last updated",
            },
          },
        },
        Post: {
          type: "object",
          required: ["title"],
          properties: {
            id: {
              type: "integer",
              description: "The auto-generated id of the post",
            },
            title: {
              type: "string",
              description: "The post title",
            },
            content: {
              type: "string",
              description: "The post content",
            },
            published: {
              type: "boolean",
              description: "Whether the post is published",
            },
            authorId: {
              type: "integer",
              description: "The id of the post author",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "The date the post was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "The date the post was last updated",
            },
          },
        },
        TokenResponse: {
          type: "object",
          properties: {
            tokens: {
              type: "integer",
              description: "Current token count",
            },
            userId: {
              type: "integer",
              description: "User ID",
            },
          },
        },
        PromptResponse: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "Generated prompt text",
            },
            tokensUsed: {
              type: "integer",
              description: "Number of tokens deducted",
            },
            tokensRemaining: {
              type: "integer",
              description: "Remaining token balance",
            },
            metadata: {
              type: "object",
              description: "Additional prompt metadata",
            },
          },
        },
        Project: {
          type: "object",
          required: ["name", "language", "code"],
          properties: {
            id: {
              type: "integer",
              description: "The auto-generated id of the project",
            },
            userId: {
              type: "integer",
              description: "The id of the project owner",
            },
            name: {
              type: "string",
              description: "The project name",
            },
            command: {
              type: "string",
              description: "Command to run the project",
            },
            language: {
              type: "string",
              description: "Programming language",
            },
            code: {
              type: "string",
              description: "Project source code",
            },
            isPublished: {
              type: "boolean",
              description: "Whether the project is published publicly",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "The date the project was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "The date the project was last updated",
            },
          },
        },
        ProjectList: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "The auto-generated id of the project",
            },
            name: {
              type: "string",
              description: "The project name",
            },
            language: {
              type: "string",
              description: "Programming language",
            },
            isPublished: {
              type: "boolean",
              description: "Whether the project is published publicly",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "The date the project was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "The date the project was last updated",
            },
          },
        },
        AIGenerateRequest: {
          type: "object",
          required: ["prompt"],
          properties: {
            prompt: {
              type: "string",
              description: "Description of the code to generate",
              example: "Create a function to calculate fibonacci numbers",
            },
            language: {
              type: "string",
              description: "Programming language for the generated code",
              example: "javascript",
            },
            context: {
              type: "string",
              description: "Additional context or requirements",
              example: "Make it recursive and add error handling",
            },
            maxTokens: {
              type: "integer",
              minimum: 100,
              maximum: 4000,
              default: 2000,
              description: "Maximum tokens to generate",
            },
            temperature: {
              type: "number",
              minimum: 0,
              maximum: 2,
              default: 0.7,
              description:
                "Creativity level (0 = deterministic, 2 = very creative)",
            },
          },
        },
        AIGenerateResponse: {
          type: "object",
          properties: {
            generatedCode: {
              type: "string",
              description: "The AI-generated code",
            },
            usage: {
              type: "object",
              properties: {
                promptTokens: {
                  type: "integer",
                  description: "Tokens used for the prompt",
                },
                completionTokens: {
                  type: "integer",
                  description: "Tokens used for the completion",
                },
                totalTokens: {
                  type: "integer",
                  description: "Total tokens used",
                },
              },
            },
            model: {
              type: "string",
              description: "The AI model used",
            },
            finishReason: {
              type: "string",
              description: "Why the generation stopped",
            },
            tokensRemaining: {
              type: "integer",
              description: "User's remaining token balance",
            },
            metadata: {
              type: "object",
              description: "Additional metadata about the request",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
            details: {
              type: "object",
              description: "Additional error details",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const specs = swaggerJsdoc(options);
