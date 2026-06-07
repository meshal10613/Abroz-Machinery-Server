// import { CacheKeys } from "../../cache/cache.keys";
// import { redisClient } from "../../config/redis";
import AppError from "../../helper/AppError";
import { Admin } from "../../models/admin.model";
import { User } from "../../models/user.model";
import { IRequestUser } from "../../types";
import { UserRole } from "../../types/user";
import { sendEmail } from "../../utils/email";
import { generateOtp } from "../../utils/generateOtp";
import { tokenUtils } from "../../utils/token";
import { LoginInput } from "./auth.interface";

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
    // const cacheKey = CacheKeys.me(userId);

    // const cached = await redisClient.get(cacheKey);

    // if (cached) {
    //     return JSON.parse(cached);
    // }

    const user = await User.findById(userId).lean();

    if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
    }

    let adminData = null;

    if (user.role === UserRole.ADMIN) {
        adminData = await Admin.findOne({ user: user._id }).lean();
    }

    const result = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        isActive: user.isActive,
        admin: adminData,
    };

    // await redisClient.set(cacheKey, JSON.stringify(result), {
    //     EX: 1800, // 30 min (safe for auth data)
    // });

    return result;
};

const changePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string,
) => {
    // 1. Find user
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
        throw new AppError(404, "User not found or inactive");
    }

    // 2. Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        throw new AppError(400, "Current password is incorrect");
    }

    // 3. Prevent same password reuse
    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
        throw new AppError(400, "New password must be different");
    }

    // 4. Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    // 🔥 invalidate auth cache
    // await redisClient.del(CacheKeys.me(userId));

    return {
        message: "Password changed successfully",
    };
};

const forgetPassword = async (email: string) => {
    const user = await User.findOne({ email, isActive: true });

    if (!user) {
        throw new AppError(404, "User not found or inactive");
    }

    const { otp, expiresAt } = generateOtp();

    user.otp = otp;
    user.otpExpiresIn = expiresAt;
    await user.save();

    await sendEmail({
        to: user.email,
        subject: "Verify your email",
        templateName: "otp",
        templateData: {
            name: user.name,
            otp,
        },
    });

    return {
        message: "OTP sent successfully",
    };
};

const verifyEmail = async (email: string, otp: string) => {
    const user = await User.findOne({ email, isActive: true });

    if (!user) {
        throw new AppError(404, "User not found or inactive");
    }

    if (!user.otp || !user.otpExpiresIn) {
        throw new AppError(400, "OTP not found. Please request a new OTP");
    }

    if (user.otp !== otp) {
        throw new AppError(400, "Invalid OTP");
    }

    if (user.otpExpiresIn.getTime() < Date.now()) {
        throw new AppError(400, "OTP has expired");
    }

    return {
        message: "Email verified successfully",
    };
};

const resetPassword = async (
    email: string,
    newPassword: string,
) => {
    const user = await User.findOne({ email, isActive: true });

    if (!user) {
        throw new AppError(404, "User not found or inactive");
    }

    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
        throw new AppError(400, "New password must be different");
    }

    user.password = newPassword;
    await user.save();

    // await redisClient.del(CacheKeys.me(user._id.toString()));

    return {
        message: "Password reset successfully",
    };
};

export const AuthService = {
    loginUser,
    getMe,
    changePassword,
    forgetPassword,
    verifyEmail,
    resetPassword,
};
