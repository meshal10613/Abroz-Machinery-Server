import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/response";
import { StatsService } from "./stats.service";

const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const result = await StatsService.getDashboardStats();

        sendSuccess(res, "Dashboard stats fetched successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to fetch dashboard stats", 400);
    }
};

export const StatsController = {
	getDashboardStats,
};