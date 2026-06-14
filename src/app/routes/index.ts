import { Request, Response, Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { adminRoutes } from "../modules/admin/admin.routes";
import { categoryRoutes } from "../modules/category/category.routes";
import { statsRoutes } from "../modules/stats/stats.routes";
import { userRoutes } from "../modules/user/user.routes";
import { productRoutes } from "../modules/product/product.routes";
import mongoose from "mongoose";
import status from "http-status";
import { customerRoutes } from "../modules/customer/customer.routes";

const router = Router();

router.get("/warmup", (_req: Request, res: Response) => {
    res.status(status.OK).json({
        success: true,
        message: "warm",
        db: mongoose.connection.readyState === 1 ? "connected" : "connecting",
        ts: Date.now(),
    });
});

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
    {
        path: "/customer",
        route: customerRoutes,
    },
];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
