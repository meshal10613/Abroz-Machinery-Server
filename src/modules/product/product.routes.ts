import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { UserRole } from "../../types/user";
import { ProductController } from "./product.controller";
import { productValidation } from "./product.validation";
import {
    validationProperty,
    zodValidate,
} from "../../middlewares/zodValidation";
import { multerUpload } from "../../config/multer";

const router = Router();

// Create product (admin only)
router.post(
    "/",
    authenticate,
    authorize(UserRole.ADMIN),
    multerUpload.array("images", 5),
    zodValidate(productValidation.createProductSchema, validationProperty.BODY),
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
    zodValidate(productValidation.updateProductSchema, validationProperty.BODY),
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
