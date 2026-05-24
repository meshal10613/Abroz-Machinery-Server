import { Schema } from "mongoose";

export const DailyStatSchema = new Schema(
    {
        date: {
            type: String,
            required: true,
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    { _id: false },
);
