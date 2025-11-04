import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newJob, setNewJob] = useState({
    company: "",
    role: "",
    location: "Remote",
    status: "Applied",
    nextStep: "",
    notes: "",
    source: "LinkedIn",
  });
  const [editingJob, setEditingJob] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const token = localStorage.getItem("token");

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await axios.patch(
          `http://localhost:5000/api/jobs/${editingJob._id}`,
          newJob,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingJob(null);
      } else {
        await axios.post("http://localhost:5000/api/jobs", newJob, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setNewJob({
        company: "",
        role: "",
        location: "Remote",
        status: "Applied",
        nextStep: "",
        notes: "",
        source: "LinkedIn",
      });
      fetchJobs();
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setNewJob({
      company: job.company,
      role: job.role,
      location: job.location,
      status: job.status,
      nextStep: job.nextStep || "",
      notes: job.notes || "",
      source: job.source || "LinkedIn",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">Loading...</p>
    );

  return (
    <div
      className={`min-h-screen py-10 px-6 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Job Tracker
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Job Form */}
        <div
          className={`p-6 rounded-2xl shadow-md transition ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-2xl font-semibold mb-4">
            {editingJob ? "Edit Job" : "Add New Job"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
            <input
              type="text"
              placeholder="Company"
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent"
              value={newJob.company}
              onChange={(e) =>
                setNewJob({ ...newJob, company: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Role"
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent"
              value={newJob.role}
              onChange={(e) =>
                setNewJob({ ...newJob, role: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Location"
              className="border rounded-md px-3 py-2 bg-transparent"
              value={newJob.location}
              onChange={(e) =>
                setNewJob({ ...newJob, location: e.target.value })
              }
            />
            <select
              className="border rounded-md px-3 py-2 bg-transparent"
              value={newJob.status}
              onChange={(e) =>
                setNewJob({ ...newJob, status: e.target.value })
              }
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Hired">Hired</option>
            </select>
            <input
              type="text"
              placeholder="Next Step"
              className="border rounded-md px-3 py-2 bg-transparent"
              value={newJob.nextStep}
              onChange={(e) =>
                setNewJob({ ...newJob, nextStep: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Source (LinkedIn, etc)"
              className="border rounded-md px-3 py-2 bg-transparent"
              value={newJob.source}
              onChange={(e) =>
                setNewJob({ ...newJob, source: e.target.value })
              }
            />
            <textarea
              placeholder="Notes"
              className="border rounded-md px-3 py-2 bg-transparent"
              value={newJob.notes}
              onChange={(e) =>
                setNewJob({ ...newJob, notes: e.target.value })
              }
            />

            <button
              type="submit"
              className="bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-700 transition"
            >
              {editingJob ? "Update Job" : "Add Job"}
            </button>
          </form>
        </div>

        {/* Job List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            My Jobs
          </h2>
          {jobs.length === 0 ? (
            <p
              className={`${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No jobs added yet.
            </p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className={`p-5 rounded-xl shadow transition hover:shadow-lg ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {job.role} @ {job.company}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {job.location} • {job.source}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Status:</span>{" "}
                        {job.status}
                      </p>
                      {job.nextStep && (
                        <p className="text-sm mt-1">
                          <span className="font-medium">Next Step:</span>{" "}
                          {job.nextStep}
                        </p>
                      )}
                      {job.notes && (
                        <p className="text-sm mt-1">{job.notes}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Applied:{" "}
                        {new Date(job.dateApplied).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(job)}
                        className="text-indigo-500 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="text-red-500 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
