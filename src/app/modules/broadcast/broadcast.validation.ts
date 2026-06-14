import z from "zod";

const sendBroadcastValidationSchema = z.object({
    customerIds: z
        .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid customer ID"))
        .min(1, "At least one customer ID is required"),

    message: z
        .string()
        .trim()
        .min(1, "Message is required")
        .max(1000, "Message cannot exceed 1000 characters"),

    batchName: z.string().trim().optional(),
});

export const broadcastValidation = {
    sendBroadcastValidationSchema,
};
