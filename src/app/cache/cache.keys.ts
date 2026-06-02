export const CacheKeys = {
    products: "products:*",
    product: (id: string) => `product:${id}`,

    categories: "categories:*",
    category: (id: string) => `category:${id}`,

    me: (id: string) => `me:${id}`,

	user: (id: string) => `user:${id}`,

	admin: (id: string) => `admin:${id}`,

    dashboard: "dashboard:stats",
};