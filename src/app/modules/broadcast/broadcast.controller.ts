import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { BroadcastService } from "./broadcast.service";

const sendBroadcast = catchAsync(async (req: Request, res: Response) => {
    const result = await BroadcastService.sendBroadcastToCustomers(req.body);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Bulk SMS broadcast initiated and logged successfully",
        data: result,
    });
});

export const BroadcastController = {
    sendBroadcast,
};
