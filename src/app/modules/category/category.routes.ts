import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { UserRole } from "../../app/types/user";
import { CategoryController } from "./category.controller";
import { validationProperty, zodValidate } from "../../middlewares/zodValidation";
import { categoryValidation } from "./category.validation";

const router = Router();

// Create category (admin only)
router.post(
    "/",
    authenticate,
    authorize(UserRole.ADMIN),
    zodValidate(categoryValidation.createCategorySchema, validationProperty.BODY),
    CategoryController.createCategory,
);

// Get all categories (public or protected depending on your choice)
router.get("/", CategoryController.getAllCategories);

// Get single category
router.get("/:id", CategoryController.getSingleCategory);

// Update category (admin only)
router.patch(
    "/:id",
    authenticate,
    authorize(UserRole.ADMIN),
    zodValidate(categoryValidation.updateCategorySchema, validationProperty.BODY),
    CategoryController.updateCategory,
);

// Delete category (admin only)
router.delete(
    "/:id",
    authenticate,
    authorize(UserRole.ADMIN),
    CategoryController.deleteCategory,
);

export const categoryRoutes = router;
