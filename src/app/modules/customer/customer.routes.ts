import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { UserRole } from "../../types/user";
import {
    validationProperty,
    zodValidate,
} from "../../middlewares/zodValidation";
import { customerValidation } from "./customer.validation";
import { CustomerController } from "./customer.controller";

const router = Router();

router.patch(
    "/:id",
    authenticate,
    authorize(UserRole.ADMIN),
    zodValidate(
        customerValidation.createCustomerSchema,
        validationProperty.BODY,
    ),
    CustomerController.createCustomer,
);

export const customerRoutes = router;
