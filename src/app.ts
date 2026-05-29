import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import { notFound } from "./app/middlewares/notFound";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Mount modules
app.use("/api/v1", router);

app.use("/", (_: Request, res: Response) => {
    res.json({
        success: true,
        message: "Welcome to Abroz Machinery API",
    });
});

// app.use(globalErrorHandler);
app.use(notFound);

export default app;
