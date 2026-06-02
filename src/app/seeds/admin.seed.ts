import { env } from "../config/env";
import { User } from "../models/user.model";
import { Admin } from "../models/admin.model";
import { UserRole } from "../types/user";

const adminInfo = {
    businessName: "AB & KBROZ MACHINERY INC.",
    businessDescription:
        "Abroz Machinery Inc., is a dealer in quality used heavy machinery, specializing in Komatsu excavators and wheel loaders. We source, inspect, and deliver reliable units with transparent history, competitive pricing, and fast support.",
    businessAddress:
        "Jose Abad Santos Avenue, San Fernando, Pampanga, San Fernando, Philippines, 2000",
    shippingInfo: "",
    social: {
        facebookPage1: "https://www.facebook.com/abrozmachinery",
        facebookPage2: "https://www.facebook.com/machinerysparepartsph",
        messengerId: "machinerysparepartsph",
        whatsappNumber: "+639175100030",
        emailAddress: "",
        websiteLink: "",
    },
};

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
            businessName: adminInfo.businessName,
            businessDescription: adminInfo.businessDescription,
            businessAddress: adminInfo.businessAddress,
            shippingInfo: adminInfo.shippingInfo,
            social: adminInfo.social,
        });

        console.log(`🌱 Admin Profile seeded: ${env.admin.email}`);
    } catch (error) {
        console.error("❌ Admin seed failed:", error);
        process.exit(1);
    }
};
