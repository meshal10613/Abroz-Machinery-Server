import { Request, Response } from "express";
import { UserService } from "./user.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { deleteFileFromCloudinary } from "../../config/cloudinary";

const updateUser = catchAsync(async (req: Request, res: Response) => {
    let payload = req.body;
    const userId = req?.user?.userId;

    const uploadedFilePath = req.file?.path || (req.file as any)?.secure_url;

    try {
        if (uploadedFilePath) {
            payload.image = uploadedFilePath; // 👈 Cloudinary URL
        }

        const result = await UserService.updateUser(userId as string, payload);

        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: "User updated successfully",
            data: result,
        });
    } catch (error) {
        if (uploadedFilePath) {
            await deleteFileFromCloudinary(uploadedFilePath).catch((err) =>
                console.error("Error cleaning up user file from Cloudinary:", err),
            );
        }
        throw error;
    }
});

export const UserController = { updateUser };
