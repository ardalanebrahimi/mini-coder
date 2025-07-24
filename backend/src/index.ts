import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import { errorHandler } from "./middleware/errorHandler";
import { authenticateJWT } from "./middleware/auth";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import tokenRoutes from "./routes/tokenRoutes";
import promptRoutes from "./routes/promptRoutes";
import projectRoutes from "./routes/projectRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API routes
app.use("/auth", authRoutes);
app.use("/me", authenticateJWT, (req, res, next) => {
  // Delegate to auth controller
  const { getCurrentUser } = require("./controllers/authController");
  getCurrentUser(req, res, next);
});
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/tokens", tokenRoutes);
app.use("/api/v1/prompts", promptRoutes);
app.use("/api/v1/projects", projectRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `📚 API Documentation available at http://localhost:${PORT}/api-docs`
  );
});

export default app;
