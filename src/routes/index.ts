import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { adminRoutes } from "../modules/admin/admin.routes";
import { categoryRoutes } from "../modules/category/category.routes";

const router = Router();

const routes: { path: string; route: Router }[] = [
    {
        path: "/auth",
        route: authRoutes,
    },
    {
        path: "/admin",
        route: adminRoutes,
    },
    {
        path: "/category",
        route: categoryRoutes,
    },
];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
