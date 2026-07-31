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

    quantity: z
        .preprocess((val) => {
            if (typeof val === "string" && val.trim() !== "") {
                const num = Number(val);
                return isNaN(num) ? val : num;
            }
            return val;
        }, z.number().int().min(0))
        .optional(),

    categoryId: objectIdSchema,

    condition: z.nativeEnum(ProductCondition),

    compatibility: z.string().optional(),

    description: z.string().min(1),

    features: z
        .preprocess((val) => {
            if (typeof val === "string") {
                try {
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed)) return parsed;
                } catch {
                    return val.split(",").map((s) => s.trim()).filter(Boolean);
                }
                return [val];
            }
            return val;
        }, z.array(z.string()))
        .optional(),

    shippingInfo: z.string().optional(),

    status: z.nativeEnum(ProductStatus).optional(),
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
