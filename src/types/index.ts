import { UserRole } from "./user";

export interface IRequestUser {
    userId: string;
    role: UserRole;
    email: string;
}

// Extend Express Request to carry the decoded user
declare global {
    namespace Express {
        interface Request {
            user?: IRequestUser;
        }
    }
}
