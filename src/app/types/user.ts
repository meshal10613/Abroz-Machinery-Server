import { Document } from "mongoose";

export enum UserRole {
    ADMIN = "admin",
    CUSTOMER = "customer",
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    image?: string;
    createdAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}
