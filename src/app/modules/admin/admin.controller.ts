import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

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
        message: "Click tracked successfully",
        data: result,
    });
});

export const AdminController = {
    updateAdminProfile,
    updateAdminClicks,
};