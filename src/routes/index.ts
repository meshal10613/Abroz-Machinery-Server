import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { adminRoutes } from "../modules/admin/admin.routes";
import { categoryRoutes } from "../modules/category/category.routes";
import { statsRoutes } from "../modules/stats/stats.routes";

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
    {
        path: "/stats",
        route: statsRoutes,
    },
];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
