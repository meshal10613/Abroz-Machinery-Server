import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const requiredEnv = (key: string) => {
    const value = process.env[key];

    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    if (value.includes("YOUR_ACTUAL_ATLAS_PASSWORD") || value.includes("<db_password>")) {
        throw new Error(`Replace the placeholder value in ${key}`);
    }

    return value;
};

export const env = {
    port: process.env.PORT || 5000,
    mongoUri: requiredEnv("MONGO_URI"),
    jwtSecret: requiredEnv("JWT_SECRET"),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    admin: {
        email: requiredEnv("ADMIN_EMAIL"),
        password: requiredEnv("ADMIN_PASSWORD"),
        name: requiredEnv("ADMIN_NAME"),
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUDE_NAME as string,
        apiKey: process.env.CLOUDINARY_API_KEY as string,
        apiSecret: process.env.CLOUDINARY_API_SECRET as string,
    },
};
