import type { Request, Response, NextFunction } from "express";
import { CookieUtils } from "../../utils/cookie";
import { jwtUtils } from "../../utils/jwt";
import { env } from "../../config/env";
import AppError from "../../helper/AppError";
import { UserRole } from "../../types/user";
import status from "http-status";

export const authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    const token = CookieUtils.getCookie(req, "token");

    if (!token) {
        throw new AppError(status.UNAUTHORIZED, "Authentication required.");
    }

    const verified = jwtUtils.verifyToken(token, env.jwtSecret);

    if (!verified.success) {
        throw new AppError(status.UNAUTHORIZED, "Invalid or expired token.");
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
            throw new AppError(status.FORBIDDEN, "Access denied.");
            return;
        }
        next();
    };
