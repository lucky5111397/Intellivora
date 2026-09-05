import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAptitude } from '../context/aptitudeContext';
import { categoriesData } from '../data/topicsData';

function formatPracticeTime(seconds = 0) {
  if (!seconds || seconds <= 0) return '0 mins';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} mins`;
}

export default function AptitudeDashboard() {
  const navigate = useNavigate();
  const { state, dispatch, fetchProgress, fetchCategories } = useAptitude();
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProgress(), fetchCategories()]);
      if (mounted) setLoading(false);
    };
    init();
    return () => { mounted = false; };
  }, [fetchProgress, fetchCategories]);

  const progress = state.progress || {};
  const totals = progress.totals || { attempted: 0, correct: 0, accuracy: 0, progress: 0, practiceTimeSeconds: 0 };
  const categoriesProgress = progress.categories || {};
  const readiness = Number(progress.readiness || 0);

  const handleSelectCategory = (categorySlug) => {
    dispatch({ type: 'SELECT_CATEGORY', payload: categorySlug });
    navigate(`/aptitude/topics?category=${categorySlug}`);
  };

  return (
    <div className="bg-apt-bg min-h-screen text-apt-text font-family-jakarta p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. Hero Header */}
        <section className="relative overflow-hidden bg-apt-surface-mid rounded-2xl shadow-md p-6 sm:p-10 border border-apt-outline-dim">
          <div className="absolute top-0 right-0 w-96 h-96 bg-apt-primary-ctr opacity-20 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-apt-secondary opacity-20 rounded-full blur-[80px] pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

          <div className="relative z-10 flex flex-col items-start gap-4">
            <div className="flex items-center gap-2 bg-apt-surface-high border border-apt-outline rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-apt-text-dim">
              <span className="material-symbols-outlined text-[16px] text-apt-primary">psychology</span>
              <span>Intellivora AI Assessment Engine 3.0</span>
              <div className="flex items-center gap-1 ml-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] uppercase">Synced with MongoDB</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-apt-text">
              Aptitude Mastery Hub
            </h1>

            <p className="max-w-2xl text-apt-text-dim text-lg">
              Comprehensive quantitative, logical, data interpretation, and verbal aptitude preparation. Powered by multi-tier AI question generation and authentic performance analytics.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-2">
              <button
                onClick={() => navigate('/aptitude/setup')}
                className="flex items-center gap-2 bg-apt-primary-ctr text-apt-primary-on px-5 py-2.5 rounded-lg font-semibold hover:bg-opacity-90 transition-colors shadow-[0_0_24px_-4px_rgba(79,70,229,0.3)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                Start Practice Drill
              </button>
              <button
                onClick={() => navigate('/aptitude/topics')}
                className="flex items-center gap-2 bg-apt-surface-high hover:bg-apt-surface-top border border-apt-outline px-5 py-2.5 rounded-lg font-semibold text-apt-text transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                Explore Full Syllabus
              </button>
              <button
                onClick={() => navigate('/history')}
                className="flex items-center gap-2 bg-apt-surface-high hover:bg-apt-surface-top border border-apt-outline px-4 py-2.5 rounded-lg text-sm font-semibold text-apt-text-dim hover:text-apt-text transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">history</span>
                Activity History
              </button>
            </div>
          </div>
        </section>

        {/* 2. 4 Key Metrics Grid (Guaranteed Zero-State for Brand New Users) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Readiness */}
          <div className="bg-apt-surface-low rounded-xl shadow-md p-5 border border-apt-outline-dim flex flex-col gap-3">
            <div className="flex items-center justify-between text-apt-text-dim">
              <div className="flex items-center gap-2 font-medium">
                <span className="material-symbols-outlined text-[20px] text-apt-primary">verified</span>
                <span>Overall Readiness</span>
              </div>
              <span className="text-xs text-apt-text-dim uppercase font-bold tracking-wider">Metric</span>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold font-family-jetbrains">{readiness}%</div>
              <div className="text-xs text-apt-text-dim bg-apt-surface-mid px-2 py-0.5 rounded font-medium">
                {totals.attempted > 0 ? 'Active Profile' : 'Brand New'}
              </div>
            </div>
            <div className="w-full h-2 mt-auto bg-apt-surface-mid rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, readiness)}%` }}
              ></div>
            </div>
          </div>

          {/* Solved */}
          <div className="bg-apt-surface-low rounded-xl shadow-md p-5 border border-apt-outline-dim flex flex-col gap-3">
            <div className="flex items-center gap-2 font-medium text-apt-text-dim">
              <span className="material-symbols-outlined text-[20px] text-blue-500">fact_check</span>
              <span>Questions Solved</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold font-family-jetbrains">{totals.attempted}</span>
              <span className="text-sm text-apt-text-dim mb-1">attempted</span>
            </div>
            <div className="mt-auto pt-2">
              <div className="h-2 rounded-full bg-apt-surface-mid overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, totals.attempted > 0 ? (totals.attempted / 50) * 100 : 0)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Accuracy */}
          <div className="bg-apt-surface-low rounded-xl shadow-md p-5 border border-apt-outline-dim flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 font-medium text-apt-text-dim">
                <span className="material-symbols-outlined text-[20px] text-purple-500">target</span>
                <span>Accuracy Rate</span>
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>
            <div className="text-3xl font-bold font-family-jetbrains">{totals.accuracy}%</div>
            <div className="mt-auto text-sm text-apt-text-dim">
              Correct: <span className="font-semibold text-emerald-400">{totals.correct}</span> / {totals.attempted}
            </div>
          </div>

          {/* Practice Time */}
          <div className="bg-apt-surface-low rounded-xl shadow-md p-5 border border-apt-outline-dim flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 font-medium text-apt-text-dim">
                <span className="material-symbols-outlined text-[20px] text-orange-500">schedule</span>
                <span>Practice Time</span>
              </div>
              <span className="material-symbols-outlined text-orange-500 text-[20px]">timer</span>
            </div>
            <div className="text-3xl font-bold font-family-jetbrains">{formatPracticeTime(totals.practiceTimeSeconds)}</div>
            <div className="mt-auto text-sm text-apt-text-dim">
              Logged in active assessment sessions
            </div>
          </div>
        </section>

        {/* 3. All 4 Aptitude Categories Section */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-apt-text">
              <span className="material-symbols-outlined text-apt-primary">category</span>
              <h2 className="text-2xl font-bold">4 Major Assessment Categories</h2>
            </div>
            <button
              onClick={() => navigate('/aptitude/topics')}
              className="text-sm text-apt-primary hover:underline font-semibold cursor-pointer"
            >
              View All 43 Topics
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoriesData.map((cat) => {
              const catProgress = categoriesProgress[cat.slug] || { attempted: 0, correct: 0, accuracy: 0, progress: 0 };
              const percent = Number(catProgress.progress || 0);
              const acc = Number(catProgress.accuracy || 0);

              return (
                <div
                  key={cat.slug}
                  onClick={() => handleSelectCategory(cat.slug)}
                  className="group relative bg-apt-surface-mid rounded-xl p-6 border border-apt-outline-dim hover:border-apt-primary/50 hover:bg-apt-surface-high transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-apt-surface-low border border-apt-outline-dim flex items-center justify-center text-apt-primary group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-apt-surface-low border border-apt-outline-dim text-apt-text-dim">
                        {cat.shortName}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-apt-text group-hover:text-apt-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-apt-text-dim mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-apt-outline-dim/50 space-y-3">
                    <div className="flex justify-between items-center text-sm font-family-jetbrains">
                      <span className="text-apt-text-dim text-xs">Progress</span>
                      <span className="font-bold text-apt-text">{percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-apt-surface-low rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-apt-text-dim pt-1">
                      <span>Solved: <b className="text-apt-text font-family-jetbrains">{catProgress.attempted}</b></span>
                      <span>Accuracy: <b className="text-emerald-400 font-family-jetbrains">{acc}%</b></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
