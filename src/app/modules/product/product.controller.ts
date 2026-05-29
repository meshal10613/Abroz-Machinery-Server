import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

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
