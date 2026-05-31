import { z } from "zod";

const updateUserSchema = z
    .object({
        name: z.string().min(1, "Name cannot be empty").trim().optional(),
    })
    .refine((data) => Object.keys(data).length > 0 || true, {
        message: "At least one field must be provided for update",
    });

export const userValidation = { updateUserSchema };
