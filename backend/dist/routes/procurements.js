import { Router } from "express";
import { createProcurement, getProcurements } from "../controllers/procurementController.js";
import { protect } from "../middleware/auth.js";
const router = Router();
router.post("/", protect, createProcurement);
router.get("/", protect, getProcurements);
export default router;
