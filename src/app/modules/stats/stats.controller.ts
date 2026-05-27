import { Request, Response } from "express";
import { StatsService } from "./stats.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const result = await StatsService.getDashboardStats();

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Dashboard stats fetched successfully",
        data: result,
    });
});

export const StatsController = {
    getDashboardStats,
};