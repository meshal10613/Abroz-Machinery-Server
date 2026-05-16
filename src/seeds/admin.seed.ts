import { env } from "../config/env";
import { User } from "../models/user.model";
import { UserRole } from "../types/user";

export const seedAdmin = async (): Promise<void> => {
    try {
        const exists = await User.findOne({ email: env.admin.email });

        if (exists) {
            console.log("✅ Admin already exists, skipping seed.");
            return;
        }

        await User.create({
            name: env.admin.name,
            email: env.admin.email,
            password: env.admin.password, // pre-save hook hashes it
            role: UserRole.ADMIN,
            isActive: true,
        });

        console.log(`🌱 Admin seeded: ${env.admin.email}`);
    } catch (error) {
        console.error("❌ Admin seed failed:", error);
        process.exit(1);
    }
};
