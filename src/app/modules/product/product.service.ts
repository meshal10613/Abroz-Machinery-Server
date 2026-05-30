import { QueryBuilder } from "../../builder/queryBuilder";
import { logActivity } from "../../helper/activity.helper";
import AppError from "../../helper/AppError";
import { ActivityMethod } from "../../models/activity.model";
import { Category } from "../../models/category.model";
import { Product } from "../../models/product.model";
import {
    CreateProductInput,
    ProductsQuery,
    UpdateProductInput,
} from "./product.interface";

const createProduct = async (input: CreateProductInput) => {
    const categoryExists = await Category.exists({
        _id: input.categoryId,
    });
    if (!categoryExists) {
        throw new AppError(404, "Category not found");
    }

    const product = await Product.create(input);
    await logActivity(
        ActivityMethod.CREATE,
        `Created product: ${product.name}`,
    );
    return product;
};

const getAllProducts = async (query: ProductsQuery) => {
    return new QueryBuilder({
        model: Product,
        query,
        searchFields: ["name", "origin", "brandName", "partNumber"],
    })
        .search()
        .filter()
        .populate({ path: "categoryId", select: "name" })
        .fields()
        .paginate();
};

const getSingleProduct = async (id: string) => {
    const product = await Product.findById(id).populate("categoryId");

    if (!product) {
        throw new AppError(404, "Product not found");
    }

    const today = new Date().toISOString().split("T")[0];

    // Use .set() to ensure Mongoose tracks the change correctly
    if (!product.analytics) {
        product.set("analytics", { totalClicks: 0, clicksByDate: [] });
    }
    const analytics = product.analytics!;
    analytics.totalClicks += 1;

    const existingDay = analytics.clicksByDate.find((item) => {
        return String(item.date).split("T")[0] === today;
    });

    if (existingDay) {
        existingDay.count += 1;
    } else {
        analytics.clicksByDate.push({ date: today, count: 1 });
    }

    // Tell Mongoose the nested analytics object was mutated
    product.markModified("analytics");

    await product.save();

    return product;
};

const updateProduct = async (id: string, input: UpdateProductInput) => {
    const product = await Product.findByIdAndUpdate(id, input, {
        new: true,
    }).populate("categoryId");

    if (!product) throw new AppError(404, "Product not found");

    await logActivity(
        ActivityMethod.UPDATE,
        `Updated product: ${product.name}`,
    );

    return product;
};

const deleteProduct = async (id: string) => {
    const product = await Product.findByIdAndDelete(id);

    if (!product) throw new AppError(404, "Product not found");

    await logActivity(
        ActivityMethod.DELETE,
        `Deleted product: ${product.name}`,
    );
};

export const ProductService = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
};
