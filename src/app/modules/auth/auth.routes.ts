import { Router } from "express";
import { authenticate, authorize } from "./auth.middleware";
import { UserRole } from "../../app/types/user";
import { AuthController } from "./auth.controller";
import {
    validationProperty,
    zodValidate,
} from "../../middlewares/zodValidation";
import { authValidation } from "./auth.validation";

const router = Router();

router.post(
    "/login",
    zodValidate(authValidation.loginSchema, validationProperty.BODY),
    AuthController.login,
);

router.get(
    "/me",
    authenticate,
    authorize(UserRole.ADMIN),
    AuthController.getMe,
);

router.patch(
    "/change-password",
    authenticate,
    authorize(UserRole.ADMIN),
    AuthController.changePassword,
);

export const authRoutes = router;
