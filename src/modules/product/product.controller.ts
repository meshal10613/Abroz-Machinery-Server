import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ProductService } from "./product.service";

const createProduct = catchAsync(async (req: Request, res: Response) => {
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
});

const getAllProducts = catchAsync(async (_req: Request, res: Response) => {
    const result = await ProductService.getAllProducts();

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Products fetched successfully",
        data: result,
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
    const { id } = req.params;

    const result = await ProductService.updateProduct(
        id as string,
        req.body,
    );

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Product updated successfully",
        data: result,
    });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await ProductService.deleteProduct(id as string);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Product deleted successfully",
        data: result,
    });
});

export const ProductController = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
};
