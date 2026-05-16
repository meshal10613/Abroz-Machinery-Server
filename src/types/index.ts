import { UserRole } from "./user";

export interface JwtPayload {
    userId: string;
    role: UserRole;
    email: string;
}

// Extend Express Request to carry the decoded user
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
