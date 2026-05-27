import { env } from "../config/env";
import { User } from "../models/user.model";
import { Admin } from "../models/admin.model";
import { UserRole } from "../types/user";

export const seedAdmin = async (): Promise<void> => {
    try {
        const exists = await User.findOne({ email: env.admin.email });

        if (exists) {
            console.log("✅ Admin already exists, skipping seed.");
            return;
        }

        // 1. Create User
        const user = await User.create({
            name: env.admin.name,
            email: env.admin.email,
            password: env.admin.password,
            role: UserRole.ADMIN,
            isActive: true,
        });

        // 2. Create Admin profile
        await Admin.create({
            user: user._id,
            businessName: "AB & KBROZ MACHINERY INC.",
        });

        console.log(`🌱 Admin Profile seeded: ${env.admin.email}`);
    } catch (error) {
        console.error("❌ Admin seed failed:", error);
        process.exit(1);
    }
};
