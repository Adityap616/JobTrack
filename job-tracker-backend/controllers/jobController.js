import mongoose from "mongoose";
import Job from "../models/Job.js";

// Create a new job
export const createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, userId: req.user._id });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Failed to create job", error });
  }
};

// Get jobs with filtering, sorting, and pagination
export const getJobs = async (req, res) => {
  try {
    const { status, company, sort, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user._id };

    if (status) query.status = status;
    if (company) query.company = { $regex: company, $options: "i" };

    let jobsQuery = Job.find(query);

    if (sort === "latest") jobsQuery = jobsQuery.sort({ createdAt: -1 });
    else if (sort === "oldest") jobsQuery = jobsQuery.sort({ createdAt: 1 });
    else if (sort === "company") jobsQuery = jobsQuery.sort({ company: 1 });

    const skip = (page - 1) * limit;
    jobsQuery = jobsQuery.skip(skip).limit(Number(limit));

    const jobs = await jobsQuery;
    const total = await Job.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      jobs,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs", error });
  }
};

// Update a job
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Job.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { ...req.body, lastUpdated: Date.now() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Job not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update job", error });
  }
};

// Delete a job
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Job.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!deleted) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job", error });
  }
};

// Get job statistics
export const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Job.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const formatted = stats.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {});

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats", error });
  }
};
