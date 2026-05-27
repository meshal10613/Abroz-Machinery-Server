import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import AppError from "../../helper/AppError";
import { catchAsync } from "../../shared/catchAsync";
import { tokenUtils } from "../../utils/token";
import { sendResponse } from "../../shared/sendResponse";

const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await AuthService.loginUser({ email, password });
    tokenUtils.setTokenCookie(res, result.token);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Login successful",
        data: result,
    });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
    const userId = req?.user?.userId;
    const data = await AuthService.getMe(userId as string);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "User fetched successfully",
        data,
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const userId = req?.user?.userId as string;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new AppError(400, "Both current and new password are required");
    }

    const result = await AuthService.changePassword(
        userId as string,
        currentPassword,
        newPassword,
    );

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: result.message,
        data: null,
    });
});

export const AuthController = { login, getMe, changePassword };
