import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import { notFound } from "./app/middlewares/notFound";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import path from "path";

const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://abroz-admin-dashboard.vercel.app",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["*"], //? 🔥 allow all headers
    }),
);

// Root route only
app.get("/", (_: Request, res: Response) => {
    res.json({
        success: true,
        message: "Welcome to Abroz Machinery API",
    });
});

// API routes
app.use("/api/v1", router);

// If neither "/" nor "/api/v1/*" matches
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
