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

const getAdminProfile = async (req: Request, res: Response) => {
    try {
        const userId = req?.user?.userId;

        const result = await AdminService.getAdminProfile(userId as string);

        sendSuccess(res, "Admin profile fetched successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to fetch admin profile", 400);
    }
};

export const AdminController = {
    updateAdminProfile,
    getAdminProfile,
};
