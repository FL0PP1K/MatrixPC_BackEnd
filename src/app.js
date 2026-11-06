import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Перевірка працездатності API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "MATRIXPC API is running"
    });
});

export default app;