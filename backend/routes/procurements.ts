import { Router } from "express";
import { createProcurement, getProcurements } from "../controllers/procurementController";
import { protect } from "../middleware/auth";

const router: Router = Router();

router.post("/", protect, createProcurement);
router.get("/", protect, getProcurements);

export default router;
