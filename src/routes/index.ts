import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";

const router = Router();

const routes: { path: string; route: Router }[] = [
    {
        path: "/auth",
        route: authRoutes,
    },
];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
