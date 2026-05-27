import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { UserRole } from "../../app/types/user";
import { AdminController } from "./admin.controller";
import {
    validationProperty,
    zodValidate,
} from "../../middlewares/zodValidation";
import { adminValidation } from "./admin.validation";

const router = Router();

// Update admin profile (admin only)
router.patch(
    "/profile",
    authenticate,
    authorize(UserRole.ADMIN),
    zodValidate(adminValidation.updateAdminSchema, validationProperty.BODY),
    AdminController.updateAdminProfile,
);

router.patch(
    "/clicks",
    zodValidate(adminValidation.updateClickSchema, validationProperty.BODY),
    AdminController.updateAdminClicks,
);

export const adminRoutes = router;
