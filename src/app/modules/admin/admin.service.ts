import { logActivity } from "../../helper/activity.helper";
import AppError from "../../helper/AppError";
import { ActivityMethod } from "../../models/activity.model";
import { Admin } from "../../models/admin.model";
import { UpdateAdminInput, UpdateClickInput } from "./admin.interface";

const updateAdminProfile = async (userId: string, input: UpdateAdminInput) => {
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
    await logActivity(
        ActivityMethod.UPDATE,
        `Updated business profile information`,
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
            (item) => String(item.date).split("T")[0] === today,
        );

        if (existingDay) {
            existingDay.count += 1;
        } else {
            analytics.whatsappClicksByDate.push({ date: today, count: 1 });
        }
    } else {
        analytics.totalMessengerClicks += 1;

        const existingDay = analytics.messengerClicksByDate.find(
            (item) => String(item.date).split("T")[0] === today,
        );

        if (existingDay) {
            existingDay.count += 1;
        } else {
            analytics.messengerClicksByDate.push({ date: today, count: 1 });
        }
    }

    admin.markModified("analytics");
    await admin.save();

    return admin;
};

export const AdminService = {
    updateAdminProfile,
    updateAdminClicks,
};
