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
import aiRoutes from "./routes/aiRoutes";
import adminRoutes from "./routes/adminRoutes";
import starRoutes from "./routes/starRoutes";
import { validateOpenAIConfig } from "./config/openai";

dotenv.config();

const app = express();
const PORT = process.env["PORT"] || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Debug route to check if swagger is working
app.get("/debug/swagger", (_req, res) => {
  res.json({
    message: "Swagger config loaded",
    hasSpecs: !!specs,
    specsType: typeof specs,
  });
});

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API routes
app.use("/auth", authRoutes);
app.use("/me", authenticateJWT, (req, res, next) => {
  // Delegate to auth controller
  const { getCurrentUser } = require("./controllers/authController");
  getCurrentUser(req, res, next);
});
app.use("/profile", authenticateJWT, (req, res, next) => {
  // Delegate to auth controller profile endpoints
  const { getProfile, updateProfile } = require("./controllers/authController");
  if (req.method === "GET") {
    getProfile(req, res, next);
  } else if (req.method === "PATCH") {
    updateProfile(req, res, next);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
});
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/tokens", tokenRoutes);
app.use("/api/v1/prompts", promptRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/stars", starRoutes);
app.use("/ai", aiRoutes);
app.use("/admin", adminRoutes);

// 404 handler
app.use("*", (_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `📚 API Documentation available at http://localhost:${PORT}/api-docs`
  );

  // Validate OpenAI configuration
  if (validateOpenAIConfig()) {
    console.log("🤖 OpenAI integration ready");
  } else {
    console.log("⚠️  OpenAI integration disabled - API key not configured");
  }
});

export default app;
