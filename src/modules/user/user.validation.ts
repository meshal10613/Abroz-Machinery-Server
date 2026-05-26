import { z } from "zod";

const updateUserSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").trim(),
});

export const userValidation = { updateUserSchema };
