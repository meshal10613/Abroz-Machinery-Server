import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import { notFound } from "./app/middlewares/notFound";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import path from "path";
import os from "os";

const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.use(
    cors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                "http://localhost:3000",
                "https://abroz-admin-dashboard.vercel.app",
                "https://abroz-admin-dashboard-with-api.vercel.app",
            ];

            // Allow requests with no origin (mobile apps, Postman, curl)
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            callback(new Error(`CORS: origin '${origin}' not allowed`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ['*'],
    }),
);

//? Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

//? Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Root route only
app.get("/", (_: Request, res: Response) => {
    res.json({
        success: true,
        message: "Welcome to Abroz Machinery API",
        instance: {
            pid: process.pid,
            hostname: os.hostname(),
        },
    });
});

// API routes
app.use("/api/v1", router);

// If neither "/" nor "/api/v1/*" matches
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
