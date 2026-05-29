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
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

CategorySchema.virtual("products", {
    ref: "Product",
    localField: "_id",
    foreignField: "categoryId",
});

export const Category = mongoose.model("Category", CategorySchema);
