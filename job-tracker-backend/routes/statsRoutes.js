import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getJobStats } from "../controllers/statsController.js";

const router = express.Router();

router.get("/", protect, getJobStats);

export default router;
