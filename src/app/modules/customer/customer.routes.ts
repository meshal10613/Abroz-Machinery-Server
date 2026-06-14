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

// Create customer (admin only)
router.post(
    "/",
    authenticate,
    authorize(UserRole.ADMIN),
    zodValidate(
        customerValidation.createCustomerSchema,
        validationProperty.BODY,
    ),
    CustomerController.createCustomer,
);

// Get all customers (admin only)
router.get(
    "/",
    authenticate,
    authorize(UserRole.ADMIN),
    CustomerController.getAllCustomers,
);

// Get single customer (admin only)
router.get(
    "/:id",
    authenticate,
    authorize(UserRole.ADMIN),
    CustomerController.getCustomerById,
);

// Update customer (admin only)
router.patch(
    "/:id",
    authenticate,
    authorize(UserRole.ADMIN),
    zodValidate(
        customerValidation.updateCustomerSchema,
        validationProperty.BODY,
    ),
    CustomerController.updateCustomerById,
);

// Delete customer (admin only)
router.delete(
    "/:id",
    authenticate,
    authorize(UserRole.ADMIN),
    CustomerController.deleteCustomerById,
);

export const customerRoutes = router;
