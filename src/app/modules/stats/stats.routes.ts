import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { UserRole } from "../../app/types/user";
import { StatsController } from "./stats.controller";

const router = Router();

router.get(
    "/dashboard",
    authenticate,
    authorize(UserRole.ADMIN),
    StatsController.getDashboardStats,
);

export const statsRoutes = router;