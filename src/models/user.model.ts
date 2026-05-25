import mongoose, { Schema, HydratedDocument, SaveOptions } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, UserRole } from "../types/user";

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 8 },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.CUSTOMER,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

// Hash password before save
UserSchema.pre("save", async function (this: HydratedDocument<IUser>) {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// Instance method to compare passwords
UserSchema.methods.comparePassword = function (candidate: string) {
    return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
