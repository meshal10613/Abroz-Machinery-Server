import { z } from "zod";
import { ProductCondition, ProductStatus } from "../../types/product";

const objectIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const createProductSchema = z.object({
    name: z.string().min(1),

    origin: z.string().optional(),

    partNumber: z.string().optional(),

    brandName: z.string().optional(),

    quantity: z.number().int().min(0),

    categoryId: objectIdSchema,

    condition: z.nativeEnum(ProductCondition),

    compatibility: z.string().optional(),

    description: z.string().min(1),

    features: z.array(z.string()).optional(),

    shippingInfo: z.string().optional(),

    conditionNotes: z.string().optional(),

    status: z.nativeEnum(ProductStatus).optional(),
});

const updateProductSchema = createProductSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0 || true, {
        message:
            "At least one field must be provided for update",
    });

export const productValidation = {
    createProductSchema,
    updateProductSchema,
};
