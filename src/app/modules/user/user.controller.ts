import { Request, Response } from "express";
import { UserService } from "./user.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const updateUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req?.user?.userId;

    const result = await UserService.updateUser(userId as string, req.body);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "User updated successfully",
        data: result,
    });
});

export const UserController = { updateUser };
