import jwt from "jsonwebtoken";
import { User } from "../../models/user.model";
import { JwtPayload } from "../../types";
import { env } from "../../config/env";
import { LoginInput, LoginResult } from "./auth.interface";

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

export const AuthService = { loginUser };