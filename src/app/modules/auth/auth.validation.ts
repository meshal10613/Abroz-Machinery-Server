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

export const authValidation = { loginSchema };
