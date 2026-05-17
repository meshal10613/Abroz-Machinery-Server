import { Admin } from "../../models/admin.model";
import { UpdateAdminInput } from "./admin.interface";

const updateAdminProfile = async (userId: string, input: UpdateAdminInput) => {
    // 1. Find admin by user ref
    const admin = await Admin.findOne({ user: userId });

    if (!admin) {
        throw new Error("Admin profile not found");
    }

    // 2. Update fields safely (partial update)
    if (input.businessName !== undefined)
        admin.businessName = input.businessName;
    if (input.businessPhoneNumber !== undefined)
        admin.businessPhoneNumber = input.businessPhoneNumber;

    if (input.facebookPage !== undefined) {
        admin.facebookPage = {
            ...admin.facebookPage,
            ...input.facebookPage,
        };
    }

    if (input.businessDescription !== undefined)
        admin.businessDescription = input.businessDescription;

    if (input.businessAddress !== undefined)
        admin.businessAddress = input.businessAddress;

    await admin.save();

    return admin;
};

const getAdminProfile = async (userId: string) => {
    const admin = await Admin.findOne({ user: userId }).populate("user");

    if (!admin) {
        throw new Error("Admin profile not found");
    }

    return admin;
};

export const AdminService = {
    updateAdminProfile,
    getAdminProfile,
};
