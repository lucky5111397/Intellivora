import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Trash2,
  DollarSign,
  MapPin,
} from "lucide-react";
import { getJobs, createJob, updateJob, deleteJob } from "../../services/careerApi.js";

const STATUS_COLUMNS = [
  { id: "Wishlist", label: "Wishlist", color: "border-slate-700 text-slate-400" },
  { id: "Applied", label: "Applied", color: "border-blue-500/40 text-blue-400" },
  { id: "Interviewing", label: "Interviewing", color: "border-amber-500/40 text-amber-400" },
  { id: "Offer", label: "Offer Received", color: "border-emerald-500/40 text-emerald-400" },
  { id: "Rejected", label: "Rejected", color: "border-rose-500/40 text-rose-400" },
];

export default function JobTrackerPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "Remote",
    salaryRange: "",
    status: "Wishlist",
    jobUrl: "",
    notes: "",
  });

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      try {
        const res = await getJobs();
        if (res?.success && res.data) {
          setJobs(res.data);
        }
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createJob(formData);
      if (res?.success && res.data) {
        setJobs([res.data, ...jobs]);
        setShowAddModal(false);
        setFormData({
          company: "",
          role: "",
          location: "Remote",
          salaryRange: "",
          status: "Wishlist",
          jobUrl: "",
          notes: "",
        });
      }
    } catch (err) {
      console.error("Create job error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateJob(id, { status: newStatus });
      if (res?.success && res.data) {
        setJobs(jobs.map((j) => (j._id === id ? res.data : j)));
      }
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteJob(id);
      if (res?.success) {
        setJobs(jobs.filter((j) => j._id !== id));
      }
    } catch (err) {
      console.error("Delete job error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Briefcase className="w-3.5 h-3.5" /> Pipeline Management
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Application Tracker (Kanban)
            </h1>
            <p className="mt-2 text-slate-400 max-w-2xl text-sm sm:text-base">
              Track and organize your interview processes, applications, offers, and deadlines.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-xl shadow-cyan-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Application
          </button>
        </div>

        {/* Kanban Board Columns */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
            {STATUS_COLUMNS.map((col) => {
              const colJobs = jobs.filter((j) => j.status === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-[#0D121D] rounded-2xl border border-slate-800 p-4 space-y-3 min-h-[500px] flex flex-col"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                      {colJobs.length}
                    </span>
                  </div>

                  {/* Cards in column */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colJobs.map((job) => (
                      <div
                        key={job._id}
                        className="bg-[#06080B] rounded-xl border border-slate-800 p-3.5 space-y-2 hover:border-slate-700 transition-all shadow group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-xs text-white truncate">{job.company}</span>
                          <button
                            onClick={() => handleDelete(job._id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-xs font-medium text-slate-300 truncate">{job.role}</div>

                        <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-900">
                          {job.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" /> {job.location}
                            </div>
                          )}
                          {job.salaryRange && (
                            <div className="flex items-center gap-1 text-emerald-400">
                              <DollarSign className="w-3 h-3" /> {job.salaryRange}
                            </div>
                          )}
                        </div>

                        {/* Status Switcher Select */}
                        <div className="pt-2">
                          <select
                            value={job.status}
                            onChange={(e) => handleStatusChange(job._id, e.target.value)}
                            className="w-full bg-[#0A0E17] text-[10px] text-slate-400 p-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500"
                          >
                            {STATUS_COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Add New Job Application</h3>

              <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Google, Amazon, Stripe"
                    className="w-full bg-[#06080B] p-2.5 rounded-lg border border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Role *</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full bg-[#06080B] p-2.5 rounded-lg border border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Remote, San Francisco"
                      className="w-full bg-[#06080B] p-2.5 rounded-lg border border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-[#06080B] p-2.5 rounded-lg border border-slate-700 text-white"
                    >
                      {STATUS_COLUMNS.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Salary Range (Optional)</label>
                  <input
                    type="text"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    placeholder="e.g. $160,000 - $190,000"
                    className="w-full bg-[#06080B] p-2.5 rounded-lg border border-slate-700 text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-cyan-500 text-black font-extrabold shadow-lg"
                  >
                    {isSubmitting ? "Adding..." : "Add to Pipeline"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
