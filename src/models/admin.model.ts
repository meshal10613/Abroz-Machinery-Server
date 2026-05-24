import mongoose, { Schema } from "mongoose";
import { DailyStatSchema } from "./stats.model";

const AdminSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        businessName: {
            type: String,
            required: true,
        },

        businessDescription: {
            type: String,
        },

        businessAddress: {
            type: String,
        },

        shippingInfo: {
            type: String,
        },

        social: {
            facebookPage1: {
                type: String,
            },
            facebookPage2: {
                type: String,
            },
            messengerId: {
                type: String,
            },
            whatsappNumber: {
                type: String,
            },
            emailAddress: {
                type: String,
            },
            websiteLink: {
                type: String,
            },
        },

        analytics: {
            totalWhatsappClicks: {
                type: Number,
                default: 0,
                min: 0,
            },

            totalMessengerClicks: {
                type: Number,
                default: 0,
                min: 0,
            },

            whatsappClicksByDate: {
                type: [DailyStatSchema],
                default: [],
            },

            messengerClicksByDate: {
                type: [DailyStatSchema],
                default: [],
            },
        },
    },
    { timestamps: true },
);

export const Admin = mongoose.model("Admin", AdminSchema);
