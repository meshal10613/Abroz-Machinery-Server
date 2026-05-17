import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { UserRole } from "../../types/user";
import { AdminController } from "./admin.controller";
import {
    validationProperty,
    zodValidate,
} from "../../middlewares/zodValidation";
import { adminValidation } from "./admin.validation";

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
    zodValidate(adminValidation.updateAdminSchema, validationProperty.BODY),
    AdminController.updateAdminProfile,
);

export const adminRoutes = router;
