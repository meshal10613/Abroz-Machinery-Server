import { Request, Response } from "express";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthService } from './auth.service';

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
        const userId = (req as any).user.userId;

        const data = await AuthService.getMe(userId);

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch user",
        });
    }
};

export const AuthController = { login, getMe };