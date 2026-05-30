import { z } from "zod";
import { Social } from "../../types/admin";

const updateClickSchema = z.object({
    type: z.nativeEnum(Social, "Invalid social type"),
});

const updateAdminSchema = z
    .object({
        businessName: z
            .string()
            .min(1, "Business name cannot be empty")
            .optional(),

        businessDescription: z
            .string()
            .min(1, "Description cannot be empty")
            .optional(),

        businessAddress: z
            .string()
            .min(1, "Address cannot be empty")
            .optional(),

        shippingInfo: z
            .string()
            .min(1, "Shipping info cannot be empty")
            .optional(),

        social: z
            .object({
                facebookPage1: z
                    .string()
                    .url("Invalid URL for Facebook page 1")
                    .or(z.literal(""))
                    .optional(),

                facebookPage2: z
                    .string()
                    .url("Invalid URL for Facebook page 2")
                    .or(z.literal(""))
                    .optional(),

                messengerId: z
                    .string()
                    .min(1, "Messenger ID cannot be empty")
                    .optional(),

                whatsappNumber: z
                    .string()
                    .min(1, "WhatsApp number cannot be empty")
                    .optional(),

                emailAddress: z
                    .string()
                    .email("Invalid email address")
                    .optional(),

                websiteLink: z
                    .string()
                    .url("Invalid website URL")
                    .or(z.literal(""))
                    .optional(),
            })
            .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    });

export const adminValidation = { updateClickSchema, updateAdminSchema };
