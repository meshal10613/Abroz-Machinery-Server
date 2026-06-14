import mongoose from "mongoose";

const broadcastHistorySchema = new mongoose.Schema(
    {
        batchName: {
            type: String,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        totalRecipients: {
            type: Number,
            required: true,
            min: 0,
        },

        successCount: {
            type: Number,
            default: 0,
        },

        failedCount: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending",
        },

        provider: {
            type: String,
            default: "bulksms",
        },

        apiResponse: {
            type: Object,
            default: null,
        },

        scheduledAt: {
            type: Date,
            default: null,
        },
        startedAt: { type: Date, default: null },
        completedAt: { type: Date, default: null },
    },
    {
        timestamps: true,
    },
);

broadcastHistorySchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 90 }, // 90 days
);

const BroadcastHistory = mongoose.model("BulkSmsBatch", broadcastHistorySchema);

export default BroadcastHistory;
