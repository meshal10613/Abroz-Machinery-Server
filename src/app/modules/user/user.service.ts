import { deleteFileFromCloudinary } from "../../config/cloudinary";
import AppError from "../../helper/AppError";
import { User } from "../../models/user.model";
import { UpdateUserInput } from "./user.interface";

const updateUser = async (userId: string, input: UpdateUserInput) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    if (user.image && input.image) {
        // Delete old image from Cloudinary
        await deleteFileFromCloudinary(user.image);
    }

    if (input.name) user.name = input.name;
    if (input.image) user.image = input.image;

    await user.save();

    return user;
};

export const UserService = { updateUser };
