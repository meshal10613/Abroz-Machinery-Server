import router from "./routes";
import { notFound } from "./middlewares/notFound";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount modules
app.use("/api/v1", router);

// Health check
app.get("/health", (_: Request, res: Response) => {
    res.json({ status: "ok" });
});

// app.use(globalErrorHandler);
app.use(notFound);

export default app;
