import "dotenv/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import authRoutes from "#src/modules/auth/routes/authRoutes.js";
import userRoutes from "#src/modules/accounts/routes/userRoutes.js";
import jobRoutes from "#src/modules/jobs/routes/jobRoutes.js";
import applicantRoutes from "#src/modules/applicants/routes/applicantRoutes.js";
import applicationRoutes from "#src/modules/applications/routes/applicationRoutes.js";
import statsRoutes from "#src/modules/applications/routes/statsRoutes.js";
import swaggerUi from "swagger-ui-express";
import specs from "../api-doc/swagger.js";
import { prisma } from "#src/prisma.js";

const app = express();
const PORT = process.env.PORT || 5002;

const maskDatabaseUrl = (connectionString) => {
  if (!connectionString) return "not configured";
  try {
    const url = new URL(connectionString);
    if (url.password) url.password = "*****";
    return url.toString();
  } catch {
    return connectionString.replace(/(postgres:\/\/[^:]+:)([^@]+)(@.+)/, "$1*****$3");
  }
};

const getBackendInfo = () => {
  const { NODE_ENV, DATABASE_URL } = process.env;
  return {
    nodeEnv: NODE_ENV || "development",
    port: PORT,
    database: maskDatabaseUrl(DATABASE_URL),
  };
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", applicantRoutes);
app.use("/api/jobs", applicationRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/stats", statsRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled request error:", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    body: req.body,
  });

  res.status(err.status || 500).json({
    status: "error",
    message: "Internal server error",
    code: err.status || 500,
    errors: [err.message || "Unexpected server error"],
  });
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", {
    message: error.message,
    stack: error.stack,
    backend: getBackendInfo(),
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    backend: getBackendInfo(),
  });
  process.exit(1);
});

const startServer = async () => {
  try {
    console.log("Starting backend with config:", getBackendInfo());
    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      if (specs) {
        console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
      }
    });
  } catch (error) {
    console.error("Failed to connect to the database:", {
      message: error.message,
      stack: error.stack,
      backend: getBackendInfo(),
    });
    process.exit(1);
  }
};

startServer();