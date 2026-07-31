import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { deleteFileFromCloudinary } from "../../config/cloudinary";

/**
 * Helper function to cleanup uploaded files
 */
const cleanupUploadedFiles = async (
    files: Express.Multer.File[] | undefined,
) => {
    if (!files || !Array.isArray(files)) return;

    try {
        const filePaths = files
            .map((file) => file.path || (file as any).secure_url)
            .filter(Boolean);
        await Promise.all(
            filePaths.map((path) => deleteFileFromCloudinary(path)),
        );
        console.log(`Cleaned up ${filePaths.length} files after error`);
    } catch (error) {
        console.error("Error during file cleanup in controller:", error);
    }
};

const createProduct = catchAsync(async (req: Request, res: Response) => {
    try {
        let payload = req.body;

        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            payload.images = (req.files as Express.Multer.File[]).map((file) => {
                const url = file.path || (file as any).secure_url;
                if (!url) {
                    throw new Error("Failed to upload image to Cloudinary");
                }
                return url;
            });
        }

        const result = await ProductService.createProduct(payload);

        sendResponse(res, {
            httpStatusCode: 201,
            success: true,
            message: "Product created successfully",
            data: result,
        });
    } catch (error) {
        // Cleanup uploaded files if product creation fails
        await cleanupUploadedFiles(req.files as Express.Multer.File[]);
        throw error;
    }
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductService.getAllProducts(req.query);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Products fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await ProductService.getSingleProduct(id as string);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Product fetched successfully",
        data: result,
    });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
    try {
        let payload = req.body;
        const { id } = req.params;

        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            payload.images = (req.files as Express.Multer.File[]).map((file) => {
                const url = file.path || (file as any).secure_url;
                if (!url) {
                    throw new Error("Failed to upload image to Cloudinary");
                }
                return url;
            });
        } else if (!payload.images) {
            // Do not erase existing images if no new files were uploaded
            delete payload.images;
        }

        const result = await ProductService.updateProduct(
            id as string,
            payload,
        );

        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: "Product updated successfully",
            data: result,
        });
    } catch (error) {
        // Cleanup uploaded files if product update fails
        await cleanupUploadedFiles(req.files as Express.Multer.File[]);
        throw error;
    }
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await ProductService.deleteProduct(id as string);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Product deleted successfully",
    });
});

export const ProductController = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
};
