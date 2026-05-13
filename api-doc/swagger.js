import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Job Application System API",
      version: "1.0.0",
      description: "Documentation for job application system",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],

    // =========================
    // SECURITY
    // =========================
    security: [
      {
        bearerAuth: [],
      },
    ],

    components: {
      // =========================
      // AUTH SCHEMES
      // =========================
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token in the format: Bearer <token>",
        },
      },

      // =========================
      // REUSABLE SCHEMAS
      // =========================
      schemas: {
        // ROLE ENUM
        Role: {
          type: "string",
          enum: ["admin", "Applicant"],
          example: "Applicant",
        },

        // ACCOUNT MODEL
        Account: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "b7d1a9c0-5d9a-4d74-8d89-7d4d2bdb1234",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              example: "john@example.com",
            },
            role: {
              $ref: "#/components/schemas/Role",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-05-13T08:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-05-13T08:00:00.000Z",
            },
          },
        },

        // REGISTER REQUEST
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              example: "john@example.com",
            },
            password: {
              type: "string",
              example: "123456",
            },
            role: {
              $ref: "#/components/schemas/Role",
            },
          },
        },

        // =========================
        // REUSABLE RESPONSE WRAPPERS
        // =========================

        // SUCCESS RESPONSE
        SuccessResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
            code: {
              type: "integer",
              example: 200,
            },
          },
        },

        // ERROR RESPONSE
        ErrorResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              example: "Internal server error",
            },
            code: {
              type: "integer",
              example: 500,
            },
            errors: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["Email already exists"],
            },
          },
        },

        // REGISTER RESPONSE
        RegisterResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/SuccessResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/Account",
                },
              },
            },
          ],
        },

        // USERS RESPONSE
        UsersResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/SuccessResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Account",
                  },
                },
              },
            },
          ],
        },
      },
    },
  },

  apis: [path.join(__dirname, "../src/modules/**/routes/*.js")],
};

const specs = swaggerJsdoc(options);

export default specs;