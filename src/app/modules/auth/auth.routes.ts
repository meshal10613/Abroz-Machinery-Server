import { Router } from "express";
import { authenticate, authorize } from "./auth.middleware";
import { AuthController } from "./auth.controller";
import {
    validationProperty,
    zodValidate,
} from "../../middlewares/zodValidation";
import { authValidation } from "./auth.validation";
import { UserRole } from "../../types/user";

const router = Router();

router.post(
    "/login",
    zodValidate(authValidation.loginSchema, validationProperty.BODY),
    AuthController.login,
);

router.post(
    "/forget-password",
    zodValidate(authValidation.forgetPasswordSchema, validationProperty.BODY),
    AuthController.forgetPassword,
);

router.post(
    "/verify-email",
    zodValidate(authValidation.verifyEmailSchema, validationProperty.BODY),
    AuthController.verifyEmail,
);

router.post(
    "/reset-password",
    zodValidate(authValidation.resetPasswordSchema, validationProperty.BODY),
    AuthController.resetPassword,
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
