import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import healthRoutes from "./routes/healthRoutes.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// API Routes
app.use("/api", healthRoutes);

export default app;