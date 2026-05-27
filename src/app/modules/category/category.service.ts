import { logActivity } from "../../helper/activity.helper";
import { ActivityMethod } from "../../models/activity.model";
import { Category } from "../../models/category.model";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.interface";

const createCategory = async (input: CreateCategoryInput) => {
    const existing = await Category.findOne({ name: input.name });
    if (existing) throw new Error("Category already exists");

    const category = await Category.create(input);
    await logActivity(
        ActivityMethod.CREATE,
        `Created category: ${category.name}`,
    );
    return category;
};

const getAllCategories = async () => {
    return await Category.find().sort({ createdAt: -1 });
};

const getSingleCategory = async (id: string) => {
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");
    return category;
};

const updateCategory = async (id: string, input: UpdateCategoryInput) => {
    const category = await Category.findByIdAndUpdate(id, input, {
        new: true,
    });

    if (!category) throw new Error("Category not found");
    await logActivity(
        ActivityMethod.UPDATE,
        `Updated category: ${category.name}}`,
    );
    return category;
};

const deleteCategory = async (id: string) => {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new Error("Category not found");

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
