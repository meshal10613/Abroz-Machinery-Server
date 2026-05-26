import type { Request, Response, NextFunction } from "express";
import { sendError } from "../../utils/response";
import { env } from "../../config/env";
import { UserRole } from "../../types/user";
import { CookieUtils } from "../../utils/cookie";
import { jwtUtils } from "../../utils/jwt";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const token = CookieUtils.getCookie(req, "token");

    if (!token) {
        sendError(res, "Authentication required.", 401);
        return;
    }

    const verified = jwtUtils.verifyToken(token, env.jwtSecret);

    if (!verified.success) {
        sendError(res, "Invalid or expired token.", 401);
        return;
    }

    req.user = {
        userId: verified?.data?.userId,
        role: verified?.data?.role,
        email: verified?.data?.email,
    };

    next();
};

// Role-based guard factory
export const authorize =
    (...roles: UserRole[]) =>
    (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            sendError(res, "Access denied.", 403);
            return;
        }
        next();
    };
