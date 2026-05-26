import { Request, Response } from "express";
import { sendSuccess, sendError } from "../../utils/response";
import { UserService } from "./user.service";

const updateUser = async (req: Request, res: Response) => {
    try {
        const userId = req?.user?.userId;

        const result = await UserService.updateUser(userId as string, req.body);

        sendSuccess(res, "User updated successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to update user", 400);
    }
};

export const UserController = { updateUser };
