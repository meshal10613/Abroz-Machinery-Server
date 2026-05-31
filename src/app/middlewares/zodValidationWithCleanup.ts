import { Response, NextFunction, Request } from "express";
import { ZodError, ZodSchema } from "zod";
import { deleteFileFromCloudinary } from "../config/cloudinary";
import { validationProperty } from "./zodValidation";

/**
 * Enhanced validation middleware that cleans up uploaded files if validation fails
 * @param schema - Zod schema for validation
 * @param property - Request property to validate (body, query, params)
 * @returns Middleware function
 */
export const zodValidateWithCleanup = (
    schema: ZodSchema,
    property: validationProperty,
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const data = req[property];

        try {
            schema.parse(data);
            next();
        } catch (error: any) {
            if (error instanceof ZodError) {
                // Clean up uploaded files if validation fails
                if (req.files && Array.isArray(req.files)) {
                    try {
                        const filePaths = (req.files as Express.Multer.File[]).map(
                            (file) => file.path,
                        );

                        // Delete all uploaded files from Cloudinary
                        await Promise.all(
                            filePaths.map((filePath) =>
                                deleteFileFromCloudinary(filePath),
                            ),
                        );

                        console.log(
                            `Cleaned up ${filePaths.length} files due to validation failure`,
                        );
                    } catch (cleanupError) {
                        console.error(
                            "Error during file cleanup:",
                            cleanupError,
                        );
                        // Continue with error response even if cleanup fails
                    }
                }

                const errors = error.issues.map((issue) => ({
                    path: issue.path.join("."),
                    message: issue.message,
                }));
                return res.status(400).json({ errors });
            }
            next(error);
        }
    };
};
