import mongoose, { Schema } from "mongoose";
import { ProductCondition, ProductStatus } from "../types/product";
import { DailyStatSchema } from "./stats.model";

const ProductSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        origin: {
            type: String,
            trim: true,
        },

        partNumber: {
            type: String,
            trim: true,
        },

        brandName: {
            type: String,
            trim: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },

        condition: {
            type: String,
            enum: Object.values(ProductCondition),
            required: true,
        },

        compatibility: {
            type: String,
        },

        description: {
            type: String,
            required: true,
        },

        features: {
            type: [String],
            default: [],
        },

        shippingInfo: {
            type: String,
        },

        conditionNotes: {
            type: String,
        },

        images: {
            type: [String],
            validate: {
                validator: function (arr: string) {
                    return arr.length <= 5;
                },
                message: "A product can have a maximum of 5 images.",
            },
            default: [],
        },

        status: {
            type: String,
            enum: Object.values(ProductStatus),
        },

        analytics: {
            totalClicks: {
                type: Number,
                default: 0,
                min: 0,
            },

            clicksByDate: {
                type: [DailyStatSchema],
                default: [],
            },
        },
    },
    { timestamps: true },
);

export const Product = mongoose.model("Product", ProductSchema);
