import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const getAdminInfo = catchAsync(async (_req: Request, res: Response) => {
    const result = await AdminService.getAdminInfo();

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Admin info retrieved successfully",
        data: result,
    });
});

const updateAdminProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req?.user?.userId;

    const result = await AdminService.updateAdminProfile(userId as string, req.body);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Admin profile updated successfully",
        data: result,
    });
});

const updateAdminClicks = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.updateAdminClicks(req.body);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: `${result.charAt(0).toUpperCase() + result.slice(1)} click tracked successfully`,
    });
});

export const AdminController = {
    getAdminInfo,
    updateAdminProfile,
    updateAdminClicks,
};
