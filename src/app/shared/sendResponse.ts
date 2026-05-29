import { Response } from "express";
import { PaginationMeta } from "../types/query";

interface IResponseData<T> {
    httpStatusCode: number;
    success: boolean;
    message: string;
    data?: T;
    meta?: PaginationMeta;
}

export const sendResponse = <T>(
    res: Response,
    responseData: IResponseData<T>,
) => {
    const { httpStatusCode, success, message, data, meta } = responseData;

    res.status(httpStatusCode).json({
        success,
        message,
        data,
        meta,
    });
};