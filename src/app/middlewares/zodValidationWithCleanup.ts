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
        // Parse req.body.data if passed as JSON string in form-data
        if (property === validationProperty.BODY && req.body?.data) {
            try {
                const parsedData =
                    typeof req.body.data === "string"
                        ? JSON.parse(req.body.data)
                        : req.body.data;
                req.body = { ...req.body, ...parsedData };
                delete req.body.data;
            } catch {
                // Keep req.body as is if JSON parsing fails
            }
        }

        const data = req[property];

        try {
            schema.parse(data);
            next();
        } catch (error: any) {
            if (error instanceof ZodError) {
                // Collect all uploaded files from req.file or req.files
                const filesToClean: Express.Multer.File[] = [];
                if (req.file) {
                    filesToClean.push(req.file);
                }
                if (req.files) {
                    if (Array.isArray(req.files)) {
                        filesToClean.push(...req.files);
                    } else {
                        Object.values(req.files).forEach((fileArray) => {
                            filesToClean.push(...fileArray);
                        });
                    }
                }

                if (filesToClean.length > 0) {
                    try {
                        const filePaths = filesToClean
                            .map((file) => file.path || (file as any).secure_url)
                            .filter(Boolean);

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
