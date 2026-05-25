import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../../types";
import { sendError } from "../../utils/response";
import { env } from "../../config/env";
import { UserRole } from "../../types/user";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        sendError(res, "No token provided.", 401);
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
        req.user = decoded;
        next();
    } catch {
        sendError(res, "Invalid or expired token.", 401);
    }
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
