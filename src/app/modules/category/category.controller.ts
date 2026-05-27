import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CategoryQuery } from "./category.interface";

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.createCategory(req.body);

    sendResponse(res, {
        httpStatusCode: 201,
        success: true,
        message: "Category created successfully",
        data: result,
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.getAllCategories(
        req.query as CategoryQuery,
    );

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Categories fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await CategoryService.getSingleCategory(id as string);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Category fetched successfully",
        data: result,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await CategoryService.updateCategory(id as string, req.body);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Category updated successfully",
        data: result,
    });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await CategoryService.deleteCategory(id as string);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Category deleted successfully",
        data: result,
    });
});

export const CategoryController = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};
