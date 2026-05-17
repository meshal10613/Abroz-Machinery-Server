import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        image: {
            type: String, // URL or file path
            required: true,
        },

        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        salePrice: {
            type: Number,
            default: 0,
        },

        onSale: {
            type: Boolean,
            default: false,
        },

        quantity: {
            type: Number,
            default: 1,
        },

        brand: {
            type: String,
            trim: true,
        },

        features: {
            type: [String], // array of features
            default: [],
        },
    },
    { timestamps: true },
);

export const Product = mongoose.model("Product", ProductSchema);
