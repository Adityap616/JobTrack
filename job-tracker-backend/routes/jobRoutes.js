import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  getStats
} from "../controllers/jobController.js";

const router = express.Router();

router.route("/")
  .post(protect, createJob)
  .get(protect, getJobs);

router.route("/stats")
  .get(protect, getStats);

router.route("/:id")
  .patch(protect, updateJob)
  .delete(protect, deleteJob);


export default router;
