
import { Router } from "express";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

import {
    createOrder,
    getMyOrders,
    getAllOrders,
    changeOrderStatus,
} from "../controllers/orderController.js";

const router = Router();

router.use(authenticateToken);

// Перегляд усіх замовлень — ADMIN
router.get("/admin", requireAdmin, getAllOrders);

// Зміна статусу замовлення — ADMIN
router.patch(
    "/admin/:id/status",
    requireAdmin,
    changeOrderStatus
);

// Історія замовлень користувача
router.get("/mine", getMyOrders);

// Створення замовлення
router.post("/", createOrder);

export default router;
