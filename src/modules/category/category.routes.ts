import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { UserRole } from "../../types/user";
import { CategoryController } from "./category.controller";

const router = Router();

// Create category (admin only)
router.post(
    "/",
    authenticate,
    authorize(UserRole.ADMIN),
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
