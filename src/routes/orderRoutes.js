import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { createOrder, getMyOrders } from "../controllers/orderController.js";
const router = Router();
router.use(authenticateToken);
router.get("/mine", getMyOrders);
router.post("/", createOrder);
export default router;
