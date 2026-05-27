import mongoose, { Schema } from "mongoose";

export enum ActivityMethod {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
}

const ActivitySchema = new Schema(
    {
        method: {
            type: String,
            enum: Object.values(ActivityMethod),
            required: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true },
);

export const Activity = mongoose.model("Activity", ActivitySchema);
