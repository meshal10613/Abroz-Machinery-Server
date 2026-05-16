import { Response } from "express";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export const sendSuccess = <T>(
    res: Response,
    message: string,
    data?: T,
    statusCode = 200,
): void => {
    const payload: ApiResponse<T> = { success: true, message, data };
    res.status(statusCode).json(payload);
};

export const sendError = (
    res: Response,
    message: string,
    statusCode = 400,
): void => {
    const payload: ApiResponse<null> = { success: false, message };
    res.status(statusCode).json(payload);
};
