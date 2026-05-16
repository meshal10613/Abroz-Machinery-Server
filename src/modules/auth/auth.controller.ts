import { Request, Response } from "express";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthService } from './auth.service';

export const login = async (req: Request, res: Response): Promise<void> => {
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
