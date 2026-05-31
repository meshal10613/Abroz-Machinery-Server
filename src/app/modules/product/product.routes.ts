import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { ProductController } from "./product.controller";
import { productValidation } from "./product.validation";
import { validationProperty } from "../../middlewares/zodValidation";
import { zodValidateWithCleanup } from "../../middlewares/zodValidationWithCleanup";
import { multerUpload } from "../../config/multer";
import { UserRole } from "../../types/user";

const router = Router();

// Create product (admin only)
router.post(
    "/",
    authenticate,
    authorize(UserRole.ADMIN),
    multerUpload.array("images", 5),
    zodValidateWithCleanup(
        productValidation.createProductSchema,
        validationProperty.BODY,
    ),
    ProductController.createProduct,
);

// Get all products
router.get("/", ProductController.getAllProducts);

// Get single product
router.get("/:id", ProductController.getSingleProduct);

// Update product (admin only)
router.patch(
    "/:id",
    authenticate,
    authorize(UserRole.ADMIN),
    multerUpload.array("images", 5),
    zodValidateWithCleanup(
        productValidation.updateProductSchema,
        validationProperty.BODY,
    ),
    ProductController.updateProduct,
);

// Delete product (admin only)
router.delete(
    "/:id",
    authenticate,
    authorize(UserRole.ADMIN),
    ProductController.deleteProduct,
);

export const productRoutes = router;
