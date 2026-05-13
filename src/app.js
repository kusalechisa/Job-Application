import express from "express";
import cors from "cors";
import authRoutes from "#/modules/auth/routes/authRoutes.js";
import userRoutes from "#/modules/accounts/routes/userRoutes.js";
import jobRoutes from "#/modules/jobs/routes/jobRoutes.js";
import swaggerUi from "swagger-ui-express";
import  specs  from "../api-doc/swagger.js";

const app = express();
const PORT = process.env.PORT || 5002;

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (specs) {
        console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    }
});