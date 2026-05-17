import jwt from "jsonwebtoken";
import { User } from "../../models/user.model";
import { JwtPayload } from "../../types";
import { env } from "../../config/env";
import { LoginInput, LoginResult } from "./auth.interface";
import { UserRole } from "../../types/user";
import { Admin } from "../../models/admin.model";

const loginUser = async (input: LoginInput): Promise<LoginResult> => {
    const { email, password } = input;

    // 1. Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) throw new Error("Invalid email or password.");

    // 2. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Invalid email or password.");

    // 3. Sign JWT
    const payload: JwtPayload = {
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
    };

    const token = jwt.sign(payload, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
    });

    return {
        token,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
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

export const AuthService = { loginUser, getMe };