import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { UserController } from "./user.controller";
import {
    validationProperty,
    zodValidate,
} from "../../middlewares/zodValidation";
import { userValidation } from "./user.validation";

const router = Router();

// Update user name (any authenticated user)
router.patch(
    "/profile",
    authenticate,
    zodValidate(userValidation.updateUserSchema, validationProperty.BODY),
    UserController.updateUser,
);

export const userRoutes = router;
