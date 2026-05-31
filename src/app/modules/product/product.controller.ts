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
        const filePaths = files.map((file) => file.path);
        await Promise.all(filePaths.map((path) => deleteFileFromCloudinary(path)));
        console.log(`Cleaned up ${filePaths.length} files after error`);
    } catch (error) {
        console.error("Error during file cleanup in controller:", error);
    }
};

const createProduct = catchAsync(async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        if (req.files && Array.isArray(req.files)) {
            payload.images = (req.files as Express.Multer.File[]).map(
                (file) => file.path,
            );
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
        const payload = req.body;
        const { id } = req.params;

        if (req.files && Array.isArray(req.files)) {
            payload.images = (req.files as Express.Multer.File[]).map(
                (file) => file.path,
            );
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
