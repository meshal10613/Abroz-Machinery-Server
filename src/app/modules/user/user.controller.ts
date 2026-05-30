import { Request, Response } from "express";
import { UserService } from "./user.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const updateUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const userId = req?.user?.userId;

    // Only update image if a new file was uploaded
    if (req.file?.path) {
        payload.image = req.file.path; // 👈 Cloudinary URL
    }
    const result = await UserService.updateUser(userId as string, payload);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "User updated successfully",
        data: result,
    });
});

export const UserController = { updateUser };
