import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { exportJobsCSV, exportJobsExcel } from "../controllers/exportController.js";

const router = express.Router();

router.get("/csv", protect, exportJobsCSV);
router.get("/excel", protect, exportJobsExcel);

export default router;
