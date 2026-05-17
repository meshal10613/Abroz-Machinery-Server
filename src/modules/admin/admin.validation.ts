import { z } from "zod";

const updateAdminSchema = z
    .object({
        businessName: z
            .string()
            .min(1, "Business name cannot be empty")
            .optional(),

        // Simple regex or .min(1) depending on how strictly you format numbers
        businessPhoneNumber: z
            .string()
            .min(1, "Phone number cannot be empty")
            .optional(),

        // Nested object validation made optional
        facebookPage: z
            .object({
                mainPage: z
                    .string()
                    .url("Invalid Facebook URL")
                    .or(z.literal(""))
                    .optional(),
                sparePartsPage: z
                    .string()
                    .url("Invalid Facebook URL")
                    .or(z.literal(""))
                    .optional(),
            })
            .optional(),

        businessDescription: z
            .string()
            .min(1, "Description cannot be empty")
            .optional(),
        businessAddress: z
            .string()
            .min(1, "Address cannot be empty")
            .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    });

export const adminValidation = { updateAdminSchema };