import { Request, Response } from "express";
import { sendSuccess, sendError } from "../../utils/response";
import { AdminService } from "./admin.service";

const updateAdminProfile = async (req: Request, res: Response) => {
    try {
        const userId = req?.user?.userId;

        const result = await AdminService.updateAdminProfile(userId as string, req.body);

        sendSuccess(res, "Admin profile updated successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to update admin profile", 400);
    }
};

const updateAdminClicks = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.updateAdminClicks(req.body);

        sendSuccess(res, "Click tracked successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to track click", 400);
    }
};

export const AdminController = {
    updateAdminProfile,
    updateAdminClicks,
};