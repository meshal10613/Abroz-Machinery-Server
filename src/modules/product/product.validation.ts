import { z } from "zod";

const createProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    image: z.string().url("Invalid image URL"),
    categoryId: z.string().min(1, "Category is required"),

    price: z.number().min(0),

    salePrice: z.number().optional(),

    onSale: z.boolean().optional(),

    quantity: z.number().int().min(0).optional(),

    brand: z.string().optional(),

    features: z.array(z.string()).optional(),
});

const updateProductSchema = createProductSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0 || true, {
        message: "At least one field must be provided for update",
    });

export const productValidation = {
    createProductSchema,
    updateProductSchema,
};
