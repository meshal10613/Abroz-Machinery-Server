import { QueryBuilder } from "../../builder/queryBuilder";
// import { CacheKeys } from "../../cache/cache.keys";
import {
    clearDashboardCache,
    clearProductCache,
} from "../../cache/cache.service";
import { deleteFileFromCloudinary } from "../../config/cloudinary";
// import { redisClient } from "../../config/redis";
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

    await clearProductCache();
    await clearDashboardCache();

    await logActivity(
        ActivityMethod.CREATE,
        `Created product: ${product.name}`,
    );

    return product;
};

const getAllProducts = async (query: ProductsQuery) => {
    const queryObj = { ...query };

    // Clean up empty, null, or undefined query parameters
    Object.keys(queryObj).forEach((key) => {
        const value = (queryObj as any)[key];
        if (
            value === undefined ||
            value === null ||
            value === "" ||
            value === "undefined" ||
            value === "null"
        ) {
            delete (queryObj as any)[key];
        }
    });

    // Map category to categoryId for DB query (accepts category name or ID)
    const targetCategoryId = queryObj.categoryId || queryObj.category;
    if (targetCategoryId) {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(targetCategoryId);
        if (isObjectId) {
            queryObj.categoryId = targetCategoryId;
        } else {
            const categoryDoc = await Category.findOne({
                name: { $regex: new RegExp(`^${targetCategoryId}$`, "i") },
            });
            if (categoryDoc) {
                queryObj.categoryId = categoryDoc._id.toString();
            } else {
                // If category name doesn't match any existing category, set to a non-existent ObjectId to return no results
                queryObj.categoryId = "000000000000000000000000";
            }
        }
        delete queryObj.category;
    }

    // const cacheKey = `products:${JSON.stringify(queryObj)}`;

    // const cached = await redisClient.get(cacheKey);

    // if (cached) {
    //     return JSON.parse(cached);
    // }

    const result = await new QueryBuilder({
        model: Product,
        query: queryObj,
        searchFields: ["name", "origin", "brandName", "partNumber"],
    })
        .search()
        .filter()
        .populate({
            path: "categoryId",
            select: "name",
        })
        .fields()
        .paginate();

    // await redisClient.set(cacheKey, JSON.stringify(result), {
    //     EX: 300, // 5 min
    // });

    return result;
};

const getSingleProduct = async (id: string) => {
    // const cached = await redisClient.get(CacheKeys.product(id));

    // if (cached) {
    //     return JSON.parse(cached);
    // }

    const product = await Product.findById(id).populate("categoryId");

    if (!product) {
        throw new AppError(404, "Product not found");
    }

    // store in cache
    // await redisClient.set(
    //     CacheKeys.product(id),
    //     JSON.stringify(product),
    //     {
    //         EX: 1800, //? 30 min
    //     }
    // );

    // 🚀 analytics ONLY ON CACHE MISS
    setImmediate(async () => {
        try {
            const today = new Date().toISOString().split("T")[0];

            await Product.updateOne(
                { _id: id },
                {
                    $inc: {
                        "analytics.totalClicks": 1,
                    },
                }
            );

            await Product.updateOne(
                {
                    _id: id,
                    "analytics.clicksByDate.date": today,
                },
                {
                    $inc: {
                        "analytics.clicksByDate.$.count": 1,
                    },
                }
            );

            await Product.updateOne(
                {
                    _id: id,
                    "analytics.clicksByDate.date": { $ne: today },
                },
                {
                    $push: {
                        "analytics.clicksByDate": {
                            date: today,
                            count: 1,
                        },
                    },
                }
            );

            // ⚡ ONLY clear dashboard when analytics is actually updated
            await clearDashboardCache();
        } catch (err) {
            console.error("Analytics update failed:", err);
        }
    });

    return product;
};

const updateProduct = async (id: string, input: UpdateProductInput) => {
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
        throw new AppError(404, "Product not found");
    }

    const oldImages = [...existingProduct.images];

    const product = await Product.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
    }).populate("categoryId");

    if (input.images?.length && oldImages.length > 0) {
        await Promise.all(
            oldImages.map((img) => deleteFileFromCloudinary(img)),
        );
    }

    await clearProductCache(id);
    await clearDashboardCache();

    await logActivity(
        ActivityMethod.UPDATE,
        `Updated product: ${product!.name}`,
    );

    return product;
};

const deleteProduct = async (id: string) => {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
        throw new AppError(404, "Product not found");
    }

    if (product.images.length > 0) {
        await Promise.all(
            product.images.map((img) => deleteFileFromCloudinary(img)),
        );
    }

    await clearProductCache(id);
    await clearDashboardCache();

    await logActivity(
        ActivityMethod.DELETE,
        `Deleted product: ${product.name}`,
    );

    return {
        message: "Product deleted successfully",
    };
};

export const ProductService = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
};
