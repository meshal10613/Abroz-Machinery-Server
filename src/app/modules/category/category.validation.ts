import { z } from "zod";

const createCategorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
    description: z.string().optional(),
});

const updateCategorySchema = createCategorySchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message:
            "At least one field (name or description) must be provided for update",
    });

export const categoryValidation = {
	createCategorySchema,
	updateCategorySchema,
};