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

// Delete documents 30 days after createdAt
ActivitySchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 days
);

export const Activity = mongoose.model("Activity", ActivitySchema);
