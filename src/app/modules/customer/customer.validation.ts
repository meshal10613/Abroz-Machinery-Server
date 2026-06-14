import z from "zod";

const createCustomerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),

    mobileNumber: z.string().trim().min(1, "Mobile number is required"),
});

const updateCustomerSchema = createCustomerSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field (name or mobileNumber) must be provided for update",
    });

export const customerValidation = {
    createCustomerSchema,
    updateCustomerSchema,
};
