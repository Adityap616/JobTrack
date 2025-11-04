import { Parser as Json2csvParser } from "json2csv";
import ExcelJS from "exceljs";
import Job from "../models/Job.js";
import mongoose from "mongoose";

// Helper to build query (same filters as getJobs)
const buildQueryFromReq = (req) => {
  const { status, company } = req.query;
  const query = { userId: mongoose.Types.ObjectId(req.user.userId) };
  if (status) query.status = status;
  if (company) query.company = { $regex: company, $options: "i" };
  return query;
};

// GET /api/jobs/export/csv
export const exportJobsCSV = async (req, res) => {
  try {
    const query = buildQueryFromReq(req);
    // For exports we usually return all matching rows; consider rate/size limits
    const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();

    if (!jobs || jobs.length === 0) {
      return res.status(200).json({ message: "No jobs to export" });
    }

    // Map to safe, flat structure for CSV
    const rows = jobs.map(j => ({
      id: j._id.toString(),
      company: j.company,
      role: j.role,
      location: j.location || "",
      status: j.status,
      dateApplied: j.dateApplied ? new Date(j.dateApplied).toISOString().split("T")[0] : "",
      nextStep: j.nextStep || "",
      source: j.source || "",
      notes: j.notes ? j.notes.replace(/\r?\n|\r/g, " ") : ""
    }));

    const fields = Object.keys(rows[0]);
    const json2csv = new Json2csvParser({ fields });
    const csv = json2csv.parse(rows);

    // Send as attachment
    res.header("Content-Type", "text/csv");
    res.attachment(`jobtrackr_jobs_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    console.error("Export CSV error:", error);
    return res.status(500).json({ message: "Failed to export CSV", error: error.message });
  }
};

// GET /api/jobs/export/excel
export const exportJobsExcel = async (req, res) => {
  try {
    const query = buildQueryFromReq(req);
    const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();

    if (!jobs || jobs.length === 0) {
      return res.status(200).json({ message: "No jobs to export" });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Jobs");

    // Define columns (key, header, width)
    sheet.columns = [
      { header: "ID", key: "id", width: 32 },
      { header: "Company", key: "company", width: 25 },
      { header: "Role", key: "role", width: 30 },
      { header: "Location", key: "location", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Date Applied", key: "dateApplied", width: 15 },
      { header: "Next Step", key: "nextStep", width: 25 },
      { header: "Source", key: "source", width: 15 },
      { header: "Notes", key: "notes", width: 50 }
    ];

    // Add rows
    jobs.forEach(j => {
      sheet.addRow({
        id: j._id.toString(),
        company: j.company,
        role: j.role,
        location: j.location || "",
        status: j.status,
        dateApplied: j.dateApplied ? new Date(j.dateApplied).toISOString().split("T")[0] : "",
        nextStep: j.nextStep || "",
        source: j.source || "",
        notes: j.notes || ""
      });
    });

    // Optional: freeze header row, bold header
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    // stream workbook to response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="jobtrackr_jobs_${Date.now()}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export Excel error:", error);
    return res.status(500).json({ message: "Failed to export Excel", error: error.message });
  }
};
