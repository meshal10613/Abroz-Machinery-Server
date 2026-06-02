import { redisClient } from "../config/redis";
import { CacheKeys } from "./cache.keys";

export const clearProductCache = async (id?: string) => {
    const keys = await redisClient.keys(CacheKeys.products);
    if (keys.length) await redisClient.del(keys);

    if (id) await redisClient.del(CacheKeys.product(id));

    await redisClient.del(CacheKeys.dashboard);
};

export const clearCategoryCache = async (id?: string) => {
    const keys = await redisClient.keys(CacheKeys.categories);
    if (keys.length) await redisClient.del(keys);

    if (id) await redisClient.del(CacheKeys.category(id));

    await redisClient.del(CacheKeys.dashboard);
};

export const clearUserCache = async (userId: string) => {
    await redisClient.del(CacheKeys.me(userId));
};

export const clearDashboardCache = async () => {
    await redisClient.del(CacheKeys.dashboard);
};