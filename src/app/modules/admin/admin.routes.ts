import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { AdminController } from "./admin.controller";
import {
    validationProperty,
    zodValidate,
} from "../../middlewares/zodValidation";
import { adminValidation } from "./admin.validation";
import { UserRole } from "../../types/user";

const router = Router();

router.get(
    "/info",
    AdminController.getAdminInfo,
);

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
