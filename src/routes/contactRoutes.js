import { Router } from "express";
import { createContactInquiry } from "../controllers/contactController.js";

const router = Router();

router.post("/", createContactInquiry);

export default router;

