import jwt from "jsonwebtoken";
import { User } from "../../models/user.model";
import { env } from "../../config/env";
import { LoginInput, LoginResult } from "./auth.interface";
import { UserRole } from "../../types/user";
import { Admin } from "../../models/admin.model";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../types";

const loginUser = async (input: LoginInput) => {
    const { email, password } = input;

    const user = await User.findOne({
        email,
        isActive: true,
    });

    if (!user) {
        throw new Error("Invalid email or password.");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        throw new Error("Invalid email or password.");
    }

    const payload: IRequestUser = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    };

    const token = tokenUtils.getToken(payload);

    return {
        token,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        },
    };
};

const getMe = async (userId: string) => {
    // 1. Get user
    const user = await User.findById(userId).lean();

    if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
    }

    let adminData = null;

    // 2. If admin → fetch admin profile
    if (user.role === UserRole.ADMIN) {
        adminData = await Admin.findOne({ user: user._id }).lean();
    }

    // 3. Return merged response
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        admin: adminData, // null if not admin
    };
};

const changePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string,
) => {
    // 1. Find user
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
    }

    // 2. Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }

    // 3. Prevent same password reuse
    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
        throw new Error("New password must be different");
    }

    // 4. Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    return {
        message: "Password changed successfully",
    };
};

export const AuthService = { loginUser, getMe, changePassword };
