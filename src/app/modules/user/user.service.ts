import { User } from "../../models/user.model";
import { UpdateUserInput } from "./user.interface";

const updateUser = async (userId: string, input: UpdateUserInput) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    user.name = input.name;

    await user.save();

    return user;
};

export const UserService = { updateUser };
