import { QueryBuilder } from "../../builder/queryBuilder";
import {
    clearCategoryCache,
    clearDashboardCache,
} from "../../cache/cache.service";
// import { redisClient } from "../../config/redis";
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

    if (existing) {
        throw new AppError(409, "Category already exists");
    }

    const category = await Category.create(input);

    await clearCategoryCache();
    await clearDashboardCache();
    await logActivity(
        ActivityMethod.CREATE,
        `Created category: ${category.name}`,
    );

    return category;
};

const getAllCategories = async (query: CategoryQuery) => {
    // const cacheKey = `categories:${JSON.stringify(query)}`;

    // const cached = await redisClient.get(cacheKey);

    // if (cached) {
    //     return JSON.parse(cached);
    // }

    const result = await new QueryBuilder({
        model: Category,
        query,
        searchFields: ["name"],
    })
        .search()
        .filter()
        .fields()
        .populate({
            path: "products",
            select: "_id",
        })
        .paginate();

    // await redisClient.set(cacheKey, JSON.stringify(result), {
    //     EX: 3600, // 1 hour
    // });

    return result;
};

const getSingleCategory = async (id: string) => {
    // const cacheKey = `category:${id}`;

    // const cached = await redisClient.get(cacheKey);

    // if (cached) {
    //     return JSON.parse(cached);
    // }

    const category = await Category.findById(id).populate("products", "_id");

    if (!category) {
        throw new AppError(404, "Category not found");
    }

    // await redisClient.set(cacheKey, JSON.stringify(category), {
    //     EX: 3600, // 1 hour
    // });

    return category;
};

const updateCategory = async (id: string, input: UpdateCategoryInput) => {
    const category = await Category.findByIdAndUpdate(id, input, {
        new: true,
    });

    if (!category) {
        throw new AppError(404, "Category not found");
    }

    await clearCategoryCache(id);
    await clearDashboardCache();
    await logActivity(
        ActivityMethod.UPDATE,
        `Updated category: ${category.name}`,
    );

    return category;
};

const deleteCategory = async (id: string) => {
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
        throw new AppError(404, "Category not found");
    }

    await clearCategoryCache(id);
    await clearDashboardCache();
    await logActivity(
        ActivityMethod.DELETE,
        `Deleted category: ${category.name}`,
    );

    return {
        message: "Category deleted successfully",
    };
};

export const CategoryService = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};
