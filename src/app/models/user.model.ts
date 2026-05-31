import mongoose, { Schema, HydratedDocument } from "mongoose";
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
        image: { type: String, default: null },
        otp: {
            type: String,
            default: null,
            validate: {
                validator: function (value: string | null) {
                    return value === null || /^\d{6}$/.test(value);
                },
                message: "OTP must be exactly 6 digits",
            },
        },

        otpExpiresIn: {
            type: Date,
            default: null,
        },
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
