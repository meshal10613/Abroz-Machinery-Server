import { QueryBuilder } from "../../builder/queryBuilder";
import { logActivity } from "../../helper/activity.helper";
import AppError from "../../helper/AppError";
import { ActivityMethod } from "../../models/activity.model";
import { Category } from "../../models/category.model";
import {
    CategoryQuery,
    CreateCategoryInput,
    UpdateCategoryInput,
} from "./category.interface";

const createCategory = async (input: CreateCategoryInput) => {
    const existing = await Category.findOne({ name: input.name });
    if (existing) throw new AppError(409, "Category already exists");

    const category = await Category.create(input);
    await logActivity(
        ActivityMethod.CREATE,
        `Created category: ${category.name}`,
    );
    return category;
};

const getAllCategories = async (query: CategoryQuery) => {
    return new QueryBuilder({
        model: Category,
        query,
        searchFields: ["name"],
    })
        .search()
        .filter()
        .fields()
        .paginate();
        // .populate("products");
};

const getSingleCategory = async (id: string) => {
    const category = await Category.findById(id);
    if (!category) throw new AppError(404, "Category not found");
    return category;
};

const updateCategory = async (id: string, input: UpdateCategoryInput) => {
    const category = await Category.findByIdAndUpdate(id, input, {
        new: true,
    });

    if (!category) throw new AppError(404, "Category not found");
    await logActivity(
        ActivityMethod.UPDATE,
        `Updated category: ${category.name}}`,
    );
    return category;
};

const deleteCategory = async (id: string) => {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new AppError(404, "Category not found");

    await logActivity(
        ActivityMethod.DELETE,
        `Deleted category: ${category.name}`,
    );

    return { message: "Category deleted successfully" };
};

export const CategoryService = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};
