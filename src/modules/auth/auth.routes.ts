import { Router } from "express";
import { login } from "./auth.controller";
import { authenticate, authorize } from "./auth.middleware";
import { UserRole } from "../../types/user";

const router = Router();

// Public
router.post("/login", login);

// Protected — admin only example
router.get("/me", authenticate, (req, res) => {
    res.json({ success: true, data: req.user });
});

// Protected — admin only
router.get("/admin-only", authenticate, authorize(UserRole.ADMIN), (req, res) => {
    res.json({ success: true, message: "Welcome, admin!" });
});

export const authRoutes = router;
