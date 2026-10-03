import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  User,
  Briefcase,
  Code,
  Globe,
  Settings,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Save,
  Loader2,
  Building,
  GraduationCap,
} from "lucide-react";
import { fetchMyProfile, updateMyProfile } from "../../services/userProfileApi.js";

const EXPERIENCE_LEVELS = [
  { value: "fresher", label: "Fresher / Student (0 yrs)" },
  { value: "0-1", label: "Entry Level (0 - 1 yr)" },
  { value: "1-3", label: "Junior (1 - 3 yrs)" },
  { value: "3-5", label: "Mid-Level (3 - 5 yrs)" },
  { value: "5+", label: "Senior (5+ yrs)" },
];

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DIFFICULTY_PREFERENCES = [
  { value: "adaptive", label: "Adaptive (Auto-Calibrate)" },
  { value: "entry", label: "Entry Level / Campus" },
  { value: "mid", label: "Mid-Level Professional" },
  { value: "senior", label: "Senior / Lead Engineering" },
];

export default function ProfilePage() {
  const { userData } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompanies, setTargetCompanies] = useState([]);
  const [companyInput, setCompanyInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("0-1");

  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Intermediate");

  const [links, setLinks] = useState({
    github: "",
    linkedin: "",
    portfolio: "",
  });

  const [preferences, setPreferences] = useState({
    difficultyPreference: "adaptive",
    emailNotifications: true,
    jobAlerts: false,
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetchMyProfile();
        if (res?.data) {
          const p = res.data;
          setHeadline(p.headline || "");
          setBio(p.bio || "");
          setTargetRole(p.targetRole || "");
          setTargetCompanies(Array.isArray(p.targetCompanies) ? p.targetCompanies : []);
          setExperienceLevel(p.experienceLevel || "0-1");
          setSkills(Array.isArray(p.skills) ? p.skills : []);
          setLinks({
            github: p.links?.github || "",
            linkedin: p.links?.linkedin || "",
            portfolio: p.links?.portfolio || "",
          });
          setPreferences({
            difficultyPreference: p.preferences?.difficultyPreference || "adaptive",
            emailNotifications: p.preferences?.emailNotifications ?? true,
            jobAlerts: p.preferences?.jobAlerts ?? false,
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        setErrorMsg("Failed to load your profile. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleAddCompany = (e) => {
    e.preventDefault();
    const trimmed = companyInput.trim();
    if (!trimmed) return;
    if (targetCompanies.includes(trimmed)) return;
    if (targetCompanies.length >= 10) {
      setErrorMsg("Maximum 10 target companies allowed.");
      return;
    }
    setTargetCompanies([...targetCompanies, trimmed]);
    setCompanyInput("");
  };

  const handleRemoveCompany = (company) => {
    setTargetCompanies(targetCompanies.filter((c) => c !== company));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg("This skill is already in your skills matrix.");
      return;
    }
    if (skills.length >= 50) {
      setErrorMsg("Maximum 50 skills allowed.");
      return;
    }
    setSkills([
      ...skills,
      { name: trimmed, level: newSkillLevel, category: "Technical" },
    ]);
    setNewSkillName("");
  };

  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSaving(true);

    try {
      const payload = {
        headline,
        bio,
        targetRole,
        targetCompanies,
        experienceLevel,
        skills,
        links,
        preferences,
      };

      const res = await updateMyProfile(payload);
      if (res?.success || res?.data) {
        setSuccessMsg("Candidate profile updated successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Profile save error:", err);
      const apiErr = err.response?.data?.message || err.message || "Failed to update profile.";
      setErrorMsg(apiErr);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading your profile workspace...</p>
        </div>
      </div>
    );
  }

  const userInitial = userData?.name ? userData.name[0].toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-[#0A1628] border border-slate-800/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg shadow-cyan-500/20 ring-4 ring-slate-800">
                {userInitial}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {userData?.name || "Candidate Workspace"}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 capitalize">
                    {userData?.plan || "Free"} Plan
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-1">{userData?.email}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    {targetRole || "Role Not Specified"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                    {experienceLevel} yrs exp
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right sm:self-center">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Practice Balance
              </span>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                {userData?.credits ?? 100} Credits
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Professional Identity */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
              <User className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Professional Identity & Career Goals</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Full Stack Developer | React, Node.js, Distributed Systems"
                  maxLength={120}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  maxLength={80}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Experience Tier
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value} className="bg-slate-900 text-white">
                      {lvl.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  About You / Summary Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief summary of your technical background, domain focus, and engineering values..."
                  maxLength={500}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                />
                <span className="text-[11px] text-slate-500 float-right mt-1">
                  {bio.length}/500 chars
                </span>
              </div>
            </div>

            {/* Target Companies Chips */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Dream & Target Companies (Max 10)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {targetCompanies.map((comp) => (
                  <span
                    key={comp}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium"
                  >
                    <Building className="w-3 h-3" />
                    {comp}
                    <button
                      type="button"
                      onClick={() => handleRemoveCompany(comp)}
                      className="text-cyan-400 hover:text-white transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {targetCompanies.length === 0 && (
                  <p className="text-xs text-slate-500 italic">No target companies added yet.</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  placeholder="Add target company (e.g. Google, Microsoft, Amazon)..."
                  maxLength={50}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleAddCompany}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Skills Matrix */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
              <Code className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Skills Matrix & Proficiency</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Skill name (e.g. React, TypeScript, Docker, PostgreSQL)..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  {SKILL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl} className="bg-slate-900 text-white">
                      {lvl}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-md shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            {/* Rendered Skill Badges */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {skills.map((skill, index) => (
                <div
                  key={`${skill.name}-${index}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-200 text-xs"
                >
                  <span className="font-semibold text-white">{skill.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      skill.level === "Advanced"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : skill.level === "Intermediate"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "bg-slate-700/50 text-slate-400"
                    }`}
                  >
                    {skill.level}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="text-slate-500 hover:text-rose-400 transition-colors ml-1"
                    title="Remove skill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {skills.length === 0 && (
                <p className="text-xs text-slate-500 italic">No skills registered yet.</p>
              )}
            </div>
          </div>

          {/* Section 3: Social & Professional Links */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
              <Globe className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">External Profiles & Portfolio</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={links.github}
                  onChange={(e) => setLinks({ ...links, github: e.target.value })}
                  placeholder="https://github.com/yourhandle"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={links.linkedin}
                  onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/yourhandle"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Portfolio / Personal Website
                </label>
                <input
                  type="url"
                  value={links.portfolio}
                  onChange={(e) => setLinks({ ...links, portfolio: e.target.value })}
                  placeholder="https://yourportfolio.dev"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Practice Preferences */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
              <Settings className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Practice & System Preferences</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Difficulty Calibration Preference
                </label>
                <select
                  value={preferences.difficultyPreference}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      difficultyPreference: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  {DIFFICULTY_PREFERENCES.map((pref) => (
                    <option key={pref.value} value={pref.value} className="bg-slate-900 text-white">
                      {pref.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1.5">
                  Calibrates the baseline difficulty for AI mock questions and practice challenges.
                </p>
              </div>

              <div className="space-y-3 sm:pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700 focus:ring-cyan-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-sm text-slate-300">
                    Receive weekly performance summaries & practice reminders
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.jobAlerts}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        jobAlerts: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700 focus:ring-cyan-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-sm text-slate-300">
                    Enable curated placement drive & job match recommendations
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile Workspace
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

