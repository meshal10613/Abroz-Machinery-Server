import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { UserRole } from "../../types/user";
import {
    validationProperty,
    zodValidate,
} from "../../middlewares/zodValidation";
import { broadcastValidation } from "./broadcast.validation";
import { BroadcastController } from "./broadcast.controller";

const router = Router();

// Send Bulk SMS Broadcast (admin only)
router.post(
    "/",
    authenticate,
    authorize(UserRole.ADMIN),
    zodValidate(
        broadcastValidation.sendBroadcastValidationSchema,
        validationProperty.BODY,
    ),
    BroadcastController.sendBroadcast,
);

export const broadcastRoutes = router;
