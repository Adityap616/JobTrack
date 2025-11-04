import Job from "../models/Job.js";
import mongoose from "mongoose";

export const getJobStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // 1️⃣ Status-based aggregation
    const statusStats = await Job.aggregate([
      { $match: { userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Convert to object like { Applied: 5, Interview: 2, Offer: 1 }
    const statusCounts = {};
    statusStats.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    // 2️⃣ Monthly trend (last 6 months)
    const monthlyTrend = await Job.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 }
    ]);

    // Format: [{ month: "2025-10", count: 3 }, ...]
    const formattedTrend = monthlyTrend
      .map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        count: item.count
      }))
      .reverse(); // oldest → newest

    // 3️⃣ Top 5 companies
    const topCompanies = await Job.aggregate([
      { $match: { userId } },
      { $group: { _id: "$company", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return res.status(200).json({
      total: statusStats.reduce((acc, s) => acc + s.count, 0),
      byStatus: statusCounts,
      monthlyTrend: formattedTrend,
      topCompanies
    });
  } catch (error) {
    console.error("Stats error:", error);
    return res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
};
