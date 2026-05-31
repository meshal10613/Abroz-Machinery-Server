import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { UserController } from "./user.controller";
import { validationProperty } from "../../middlewares/zodValidation";
import { userValidation } from "./user.validation";
import { multerUpload } from "../../config/multer";
import { zodValidateWithCleanup } from "../../middlewares/zodValidationWithCleanup";

const router = Router();

// Update user name (any authenticated user)
router.patch(
    "/profile",
    authenticate,
    multerUpload.single("image"),
    zodValidateWithCleanup(
        userValidation.updateUserSchema,
        validationProperty.BODY,
    ),
    UserController.updateUser,
);

export const userRoutes = router;
