import mongoose, { Schema } from "mongoose";

const AdminSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // one admin per user
        },
        businessName: { type: String, required: true },
        businessPhoneNumber: { type: String, required: true },

        facebookPage: {
            mainPage: { type: String },
            sparePartsPage: { type: String },
        },

        businessDescription: { type: String },
        businessAddress: { type: String },
    },
    { timestamps: true },
);

export const Admin = mongoose.model("Admin", AdminSchema);
