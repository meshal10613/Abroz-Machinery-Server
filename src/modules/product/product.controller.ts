import { Request, Response } from "express";
import { sendSuccess, sendError } from "../../utils/response";
import { ProductService } from "./product.service";

const createProduct = async (req: Request, res: Response) => {
    try {
        const result = await ProductService.createProduct(req.body);

        sendSuccess(res, "Product created successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to create product", 400);
    }
};

const getAllProducts = async (_req: Request, res: Response) => {
    try {
        const result = await ProductService.getAllProducts();

        sendSuccess(res, "Products fetched successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to fetch products", 400);
    }
};

const getSingleProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await ProductService.getSingleProduct(id as string);

        sendSuccess(res, "Product fetched successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to fetch product", 400);
    }
};

const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await ProductService.updateProduct(id as string, req.body);

        sendSuccess(res, "Product updated successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to update product", 400);
    }
};

const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await ProductService.deleteProduct(id as string);

        sendSuccess(res, "Product deleted successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to delete product", 400);
    }
};

export const ProductController = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
};
