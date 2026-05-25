import type { Request, Response } from "express";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthService } from "./auth.service";

const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            sendError(res, "Email and password are required.", 400);
            return;
        }

        const result = await AuthService.loginUser({ email, password });
        sendSuccess(res, "Login successful.", result);
    } catch (error: any) {
        sendError(res, error.message || "Login failed.", 401);
    }
};

const getMe = async (req: Request, res: Response) => {
    try {
        const userId = req?.user?.userId;
        const data = await AuthService.getMe(userId as string);

        sendSuccess(res, "User fetched successfully", data, 200);
    } catch (error: any) {
        sendError(res, error.message || "Failed to fetch user", 400);
    }
};

const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = req?.user?.userId as string;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            sendError(res, "Both current and new password are required", 400);
            return;
        }

        const result = await AuthService.changePassword(
            userId as string,
            currentPassword,
            newPassword,
        );

        sendSuccess(res, result.message, null, 200);
    } catch (error: any) {
        sendError(res, error.message || "Failed to change password", 400);
    }
};

export const AuthController = { login, getMe, changePassword };
