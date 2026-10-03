import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart2,
  Server,
  ArrowRight,
  Search,
} from "lucide-react";
import { getSystemDesignProblems } from "../../services/systemDesignApi.js";

export default function SystemDesignCatalog() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadProblems() {
      setLoading(true);
      try {
        const res = await getSystemDesignProblems({ search: search.trim() || undefined });
        if (res?.success && res.data?.items) {
          setProblems(res.data.items);
        }
      } catch (err) {
        console.error("Failed to load system design problems:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProblems();
  }, [search]);

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <BarChart2 className="w-3.5 h-3.5" /> High-Scale Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            System Design Workspace
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl text-sm sm:text-base">
            Architect distributed systems, design scalable data schemas, articulate trade-offs,
            and receive multi-dimensional AI rubric evaluations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search system design problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0D121D] rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Problem Cards */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : problems.length === 0 ? (
          <div className="py-16 text-center bg-[#0D121D] rounded-2xl border border-slate-800">
            <Server className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">No design problems found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {problems.map((prob) => {
              const meta = prob.systemDesignMetadata || {};
              const scale = meta.scaleRequirements || {};
              return (
                <div
                  key={prob.slug}
                  className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize text-amber-400 bg-amber-500/10 border border-amber-500/20">
                        {prob.difficulty}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(prob.companyTags || []).slice(0, 3).map((comp) => (
                          <span key={comp} className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {prob.title}
                    </h3>

                    <p className="text-slate-400 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                      {prob.description}
                    </p>

                    {/* Scale Badges */}
                    {scale.dau && (
                      <div className="p-3 rounded-xl bg-[#06080B] border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Scale</span>
                          <span className="text-slate-200 font-medium">{scale.dau}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Throughput</span>
                          <span className="text-slate-200 font-medium">{scale.qps}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      4-Dimension Architectural Rubric
                    </span>
                    <Link
                      to={`/prepare/system-design/${prob.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black font-bold text-xs transition-all"
                    >
                      Enter Workspace <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
