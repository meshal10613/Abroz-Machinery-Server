import dotenv from "dotenv";
import AppError from "../helper/AppError";
import status from "http-status";

dotenv.config();

const requiredEnv = (key: string) => {
    const value = process.env[key];

    if (!value) {
        throw new AppError(
            status.BAD_REQUEST,
            `Missing required environment variable: ${key}`,
        );
    }

    if (
        value.includes("YOUR_ACTUAL_ATLAS_PASSWORD") ||
        value.includes("<db_password>")
    ) {
        throw new AppError(
            status.BAD_REQUEST,
            `Replace the placeholder value in ${key}`,
        );
    }

    return value;
};

export const env = {
    port: requiredEnv("PORT"),
    mongoUri: requiredEnv("MONGO_URI"),
    jwtSecret: requiredEnv("JWT_SECRET"),
    jwtExpiresIn: requiredEnv("JWT_EXPIRES_IN"),
    admin: {
        email: requiredEnv("ADMIN_EMAIL"),
        password: requiredEnv("ADMIN_PASSWORD"),
        name: requiredEnv("ADMIN_NAME"),
    },
    cloudinary: {
        cloudName: requiredEnv("CLOUDINARY_CLOUDE_NAME"),
        apiKey: requiredEnv("CLOUDINARY_API_KEY"),
        apiSecret: requiredEnv("CLOUDINARY_API_SECRET"),
    },
    emailSender: {
        user: requiredEnv("SMTP_USER"),
        pass: requiredEnv("SMTP_PASS"),
        host: requiredEnv("SMTP_HOST"),
        port: requiredEnv("SMTP_PORT"),
        from: requiredEnv("SMTP_FROM"),
    },
};
