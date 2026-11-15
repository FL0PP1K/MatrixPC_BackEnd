
import { Router } from "express";

import {
    getProducts,
    addProduct,
} from "../controllers/productController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = Router();

// Отримання товарів — доступно всім
router.get("/", getProducts);

// Додавання товару — тільки для ADMIN
router.post("/", authenticateToken, requireAdmin, addProduct);

export default router;
