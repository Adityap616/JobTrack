import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String, default: "Remote" },
  status: {
    type: String,
    enum: ["Applied", "Interview", "Offer", "Rejected", "Hired"],
    default: "Applied"
  },
  dateApplied: { type: Date, default: Date.now },
  nextStep: { type: String },
  notes: { type: String },
  source: { type: String, default: "LinkedIn" },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);
