import { z } from "zod";

const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),

    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters"),
    // Best practice: Keep login password validation loose (just check for presence)
    // and enforce strict length/complexity rules during registration instead.
});

const forgetPasswordSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
});

const verifyEmailSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    otp: z
        .string()
        .min(1, "OTP is required")
        .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

const resetPasswordSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    otp: z
        .string()
        .min(1, "OTP is required")
        .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
    newPassword: z
        .string()
        .min(1, "New password is required")
        .min(8, "New password must be at least 8 characters"),
});

export const authValidation = {
    loginSchema,
    forgetPasswordSchema,
    verifyEmailSchema,
    resetPasswordSchema,
};
