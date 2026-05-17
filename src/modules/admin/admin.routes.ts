import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { UserRole } from "../../types/user";
import { AdminController } from "./admin.controller";

const router = Router();

// Get admin profile (admin only)
router.get(
    "/me",
    authenticate,
    authorize(UserRole.ADMIN),
    AdminController.getAdminProfile,
);

// Update admin profile (admin only)
router.patch(
    "/me",
    authenticate,
    authorize(UserRole.ADMIN),
    AdminController.updateAdminProfile,
);

export const adminRoutes = router;
