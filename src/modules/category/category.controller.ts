import { Request, Response } from "express";
import { sendSuccess, sendError } from "../../utils/response";
import { CategoryService } from "./category.service";

const createCategory = async (req: Request, res: Response) => {
    try {
        const result = await CategoryService.createCategory(req.body);

        sendSuccess(res, "Category created successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to create category", 400);
    }
};

const getAllCategories = async (_req: Request, res: Response) => {
    try {
        const result = await CategoryService.getAllCategories();

        sendSuccess(res, "Categories fetched successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to fetch categories", 400);
    }
};

const getSingleCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await CategoryService.getSingleCategory(id as string);

        sendSuccess(res, "Category fetched successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to fetch category", 400);
    }
};

const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await CategoryService.updateCategory(id as string, req.body);

        sendSuccess(res, "Category updated successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to update category", 400);
    }
};

const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await CategoryService.deleteCategory(id as string);

        sendSuccess(res, "Category deleted successfully", result);
    } catch (error: any) {
        sendError(res, error.message || "Failed to delete category", 400);
    }
};

export const CategoryController = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};
