import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";
import AppError from "../helper/AppError";
import { MongoServerError } from 'mongodb';

const globalErrorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    let statusCode = 500;
    let message = "Internal Server Error";

    // AppError (custom)
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // Mongoose Validation Error
    else if (err instanceof MongooseError.ValidationError) {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    // Mongoose Cast Error (invalid ObjectId)
    else if (err instanceof MongooseError.CastError) {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // MongoDB Duplicate Key Error
    else if (err instanceof MongoServerError && err.code === 11000) {
        statusCode = 409;
        const field = Object.keys((err as any).keyValue || {}).join(", ");
        message = `${field} already exists`;
    }

    // JWT Errors
    else if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    else if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    // Mongoose Document Not Found
    else if (err.name === "DocumentNotFoundError") {
        statusCode = 404;
        message = "Document not found";
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};

export default globalErrorHandler;