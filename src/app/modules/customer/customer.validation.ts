import z from "zod";

const createCustomerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),

    mobileNumber: z.string().trim().min(1, "Mobile number is required"),
});

export const customerValidation = { createCustomerSchema };
