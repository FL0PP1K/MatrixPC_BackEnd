
import { Router } from "express";

import {
    getProducts,
    addProduct,
    editProduct,
    removeProduct,
} from "../controllers/productController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = Router();

// Перегляд товарів — для всіх
router.get("/", getProducts);

// Усі наступні маршрути — тільки для ADMIN
router.use(authenticateToken, requireAdmin);

// Додавання товару
router.post("/", addProduct);

// Редагування товару
router.patch("/:id", editProduct);

// Видалення товару
router.delete("/:id", removeProduct);

export default router;
