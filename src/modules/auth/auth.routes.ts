import { Router } from "express";
import { authenticate, authorize } from "./auth.middleware";
import { UserRole } from "../../types/user";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/login", AuthController.login);

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
