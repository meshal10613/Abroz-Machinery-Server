import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { adminRoutes } from "../modules/admin/admin.routes";
import { categoryRoutes } from "../modules/category/category.routes";
import { statsRoutes } from "../modules/stats/stats.routes";
import { userRoutes } from "../modules/user/user.routes";
import { productRoutes } from "../modules/product/product.routes";

const router = Router();

const routes: { path: string; route: Router }[] = [
    {
        path: "/auth",
        route: authRoutes,
    },
    {
        path: "/user",
        route: userRoutes,
    },
    {
        path: "/admin",
        route: adminRoutes,
    },
    {
        path: "/stats",
        route: statsRoutes,
    },
    {
        path: "/category",
        route: categoryRoutes,
    },
    {
        path: "/product",
        route: productRoutes,
    },
];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
