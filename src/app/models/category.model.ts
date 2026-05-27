import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true },
);

export const Category = mongoose.model("Category", CategorySchema);
