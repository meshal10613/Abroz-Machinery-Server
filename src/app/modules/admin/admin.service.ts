// import { CacheKeys } from "../../cache/cache.keys";
// import { clearDashboardCache } from "../../cache/cache.service";
// import { redisClient } from "../../config/redis";
import { logActivity } from "../../helper/activity.helper";
import AppError from "../../helper/AppError";
import { ActivityMethod } from "../../models/activity.model";
import { Admin } from "../../models/admin.model";
import { UpdateAdminInput, UpdateClickInput } from "./admin.interface";

const getAdminInfo = async () => {
    // const cached = await redisClient.get(CacheKeys.admin("info"));

    // if (cached) {
    //     return JSON.parse(cached);
    // }

    const admin = await Admin.findOne()
        .select("-__v -createdAt -updatedAt -analytics")
        .lean();

    if (!admin) {
        throw new AppError(404, "Admin not found");
    }

    // await redisClient.set(CacheKeys.admin("info"), JSON.stringify(admin), {
    //     EX: 3600, // 1 hour
    // });

    return admin;
};

const updateAdminProfile = async (
    userId: string,
    input: UpdateAdminInput
) => {
    const admin = await Admin.findOne({ user: userId });

    if (!admin) {
        throw new AppError(404, "Admin profile not found");
    }

    if (input.businessName !== undefined)
        admin.businessName = input.businessName;

    if (input.businessDescription !== undefined)
        admin.businessDescription = input.businessDescription;

    if (input.businessAddress !== undefined)
        admin.businessAddress = input.businessAddress;

    if (input.shippingInfo !== undefined)
        admin.shippingInfo = input.shippingInfo;

    if (input.social !== undefined) {
        admin.set("social", {
            ...admin.social,
            ...input.social,
        });
    }

    await admin.save();

    // 🔥 invalidate cache
    // await redisClient.del(CacheKeys.admin("info"));

    await logActivity(
        ActivityMethod.UPDATE,
        `Updated business profile information`
    );

    return admin;
};

const updateAdminClicks = async (input: UpdateClickInput) => {
    const admin = await Admin.findOne();

    if (!admin) {
        throw new AppError(404, "Admin profile not found");
    }

    const today = new Date().toISOString().split("T")[0];

    if (!admin.analytics) {
        admin.set("analytics", {
            totalWhatsappClicks: 0,
            totalMessengerClicks: 0,
            whatsappClicksByDate: [],
            messengerClicksByDate: [],
        });
    }

    const analytics = admin.analytics!;

    if (input.type === "whatsapp") {
        analytics.totalWhatsappClicks += 1;

        const existingDay = analytics.whatsappClicksByDate.find(
            (item) =>
                String(item.date).split("T")[0] === today
        );

        if (existingDay) {
            existingDay.count += 1;
        } else {
            analytics.whatsappClicksByDate.push({
                date: today,
                count: 1,
            });
        }
    } else {
        analytics.totalMessengerClicks += 1;

        const existingDay = analytics.messengerClicksByDate.find(
            (item) =>
                String(item.date).split("T")[0] === today
        );

        if (existingDay) {
            existingDay.count += 1;
        } else {
            analytics.messengerClicksByDate.push({
                date: today,
                count: 1,
            });
        }
    }

    admin.markModified("analytics");
    await admin.save();

    // optional but safe:
    // await redisClient.del(CacheKeys.admin("info"));
    // await clearDashboardCache();

    return input.type;
};

export const AdminService = {
    getAdminInfo,
    updateAdminProfile,
    updateAdminClicks,
};
