import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building,
  CheckCircle2,
  Layers,
  Code2,
  Award,
  ArrowRight,
} from "lucide-react";
import { getTargetCompanies, getCompanyDetails } from "../../services/careerApi.js";

export default function CompanyPreparationPage() {
  const { company: routeCompany } = useParams();
  const [companies, setCompanies] = useState(["Google", "Amazon", "Meta", "Microsoft", "Uber", "Apple"]);
  const [activeCompany, setActiveCompany] = useState(routeCompany || "Google");
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await getTargetCompanies();
        if (res?.success && res.data) {
          setCompanies(res.data);
          if (!routeCompany && res.data.length > 0) {
            setActiveCompany(res.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load companies:", err);
      }
    }
    loadCompanies();
  }, [routeCompany]);

  useEffect(() => {
    async function loadDetails() {
      if (!activeCompany) return;
      setLoading(true);
      try {
        const res = await getCompanyDetails(activeCompany);
        if (res?.success && res.data) {
          setCompanyData(res.data);
        }
      } catch (err) {
        console.error("Failed to load company details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [activeCompany]);

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Building className="w-3.5 h-3.5" /> Target Enterprise Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Company-Specific Interview Preparation
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl text-sm sm:text-base">
            Deconstruct hiring loops, core evaluation rubrics, cultural leadership principles,
            and company-tagged coding problems.
          </p>
        </div>

        {/* Company Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {companies.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCompany(c)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                activeCompany === c
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                  : "bg-[#0D121D] border border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : companyData ? (
          <div className="space-y-8">
            {/* Overview Card */}
            <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-extrabold text-xl">
                  {activeCompany.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{activeCompany} Interview Guide</h2>
                  <p className="text-xs text-slate-400">Calibrated against active engineering interview bars</p>
                </div>
              </div>

              {/* 3 Sections Grid: Rounds, Focus Areas, Values */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/80">
                {/* Rounds */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Hiring Pipeline Rounds
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(companyData.profile?.rounds || []).map((r, i) => (
                      <li key={i} className="p-2.5 rounded-lg bg-[#06080B] border border-slate-800">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Focus Areas */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Key Focus Domains
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(companyData.profile?.focusAreas || []).map((f, i) => (
                      <li key={i} className="p-2.5 rounded-lg bg-[#06080B] border border-slate-800">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Values & Culture */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Culture & Principles
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(companyData.profile?.values || []).map((v, i) => (
                      <li key={i} className="p-2.5 rounded-lg bg-[#06080B] border border-slate-800">
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Tagged Problems Table */}
            <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" /> Frequently Asked Questions at {activeCompany}
              </h3>

              {companyData.questions?.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No direct problem tags yet for {activeCompany}. Practice our core catalog!
                </p>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {companyData.questions.map((q) => (
                    <div key={q.slug} className="py-3.5 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-sm text-white hover:text-cyan-400 transition-colors">
                          <Link to={q.contentType === "dsa" ? `/prepare/dsa/${q.slug}` : `/prepare/system-design/${q.slug}`}>
                            {q.title}
                          </Link>
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <span className="capitalize">{q.contentType.replace("_", " ")}</span>
                          <span>&bull;</span>
                          <span>{q.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 text-xs rounded-full capitalize font-semibold ${
                          q.difficulty === "easy"
                            ? "text-emerald-400 bg-emerald-500/10"
                            : "text-amber-400 bg-amber-500/10"
                        }`}>
                          {q.difficulty}
                        </span>
                        <Link
                          to={q.contentType === "dsa" ? `/prepare/dsa/${q.slug}` : `/prepare/system-design/${q.slug}`}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black text-xs font-bold transition-all flex items-center gap-1"
                        >
                          Solve <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
