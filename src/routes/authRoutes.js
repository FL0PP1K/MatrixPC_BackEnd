import { Router } from "express";

import {
    register,
    login,
    getMe,
    updateProfile,
} from "../controllers/authController.js";

import {
    authenticateToken,
} from "../middleware/authMiddleware.js";

const router = Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me — захищений маршрут
router.get("/me", authenticateToken, getMe);
router.put("/me", authenticateToken, updateProfile);

export default router;
