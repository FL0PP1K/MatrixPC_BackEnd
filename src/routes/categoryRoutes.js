
import { Router } from "express";

import {
    getCategories,
    addCategory,
    editCategory,
    removeCategory,
} from "../controllers/categoryController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = Router();

// Перегляд категорій для всіх
router.get("/", getCategories);

// Зміни тільки для адміністратора
router.use(authenticateToken, requireAdmin);

router.post("/", addCategory);
router.patch("/:id", editCategory);
router.delete("/:id", removeCategory);

export default router;
