import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAptitude } from '../context/aptitudeContext';
import { topicsData, categoriesData } from '../data/topicsData';

export default function TopicSelection() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, dispatch, fetchProgress } = useAptitude();
  const { selectedTopic } = state;

  const initialCategory = searchParams.get('category') || state.selectedCategory || 'quantitative';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDifficultyFilter, setActiveDifficultyFilter] = useState('All');

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && categoriesData.some((c) => c.slug === cat)) {
      setActiveCategory(cat);
      dispatch({ type: 'SELECT_CATEGORY', payload: cat });
    }
  }, [searchParams, dispatch]);

  const handleCategoryTab = (catSlug) => {
    setActiveCategory(catSlug);
    setSearchParams({ category: catSlug });
    dispatch({ type: 'SELECT_CATEGORY', payload: catSlug });
  };

  const userTopicsProgress = state.progress?.topics || {};

  const filteredTopics = useMemo(() => {
    return topicsData.filter((topic) => {
      // Category filter
      if (activeCategory !== 'all' && topic.category !== activeCategory) {
        return false;
      }
      // Search filter
      const matchesSearch =
        topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Difficulty filter
      if (activeDifficultyFilter !== 'All') {
        if (topic.difficulty?.toLowerCase() !== activeDifficultyFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [activeCategory, searchQuery, activeDifficultyFilter]);

  const handleSelectTopic = (topic) => {
    dispatch({ type: 'SELECT_CATEGORY', payload: topic.category });
    dispatch({ type: 'SELECT_TOPIC', payload: topic.id });
  };

  const handleConfigureSetup = () => {
    if (selectedTopic) {
      navigate('/aptitude/setup');
    }
  };

  const selectedTopicData = useMemo(() => {
    return topicsData.find((t) => t.id === selectedTopic);
  }, [selectedTopic]);

  const activeCategoryObj = categoriesData.find((c) => c.slug === activeCategory) || {
    name: 'All Categories',
    description: 'Explore the complete comprehensive aptitude curriculum across all testable domains.',
  };

  return (
    <div className="min-h-screen bg-apt-bg text-apt-text font-family-jakarta pb-32 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* 1. Breadcrumb Rail */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <nav className="flex items-center space-x-2 text-sm font-medium text-apt-text-dim">
            <Link to="/" className="hover:text-apt-text transition-colors flex items-center">
              <span className="material-symbols-outlined text-lg mr-1">home</span>
              Home
            </Link>
            <span>/</span>
            <Link to="/aptitude" className="hover:text-apt-text transition-colors">
              Aptitude Dashboard
            </Link>
            <span>/</span>
            <span className="text-apt-primary font-semibold">{activeCategoryObj.name}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/history')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-apt-surface-low rounded-lg border border-apt-outline-dim text-xs font-semibold hover:bg-apt-surface-mid transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-apt-secondary">history</span>
              <span>Past Attempts</span>
            </button>
          </div>
        </div>

        {/* 2. Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-apt-surface-mid rounded-2xl p-6 md:p-8 border border-apt-outline-dim">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-apt-primary/20 text-apt-primary rounded">
                Syllabus Explorer
              </span>
              <span className="text-sm font-medium text-apt-text-dim">
                {filteredTopics.length} Topics Available
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {activeCategoryObj.name}
            </h1>
            <p className="text-apt-text-dim text-base leading-relaxed">
              {activeCategoryObj.description}
            </p>
          </div>
        </div>

        {/* 3. Category Tabs (All 4 Categories) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-apt-outline-dim">
          {categoriesData.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => handleCategoryTab(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-apt-primary-ctr text-white shadow-md'
                    : 'bg-apt-surface-low text-apt-text-dim hover:bg-apt-surface-mid hover:text-apt-text border border-apt-outline-dim'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Search & Filter Section */}
        <div className="bg-apt-surface-low rounded-xl p-4 border border-apt-outline-dim flex flex-col md:flex-row gap-4">
          <div className="relative grow max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-apt-text-dim">
              search
            </span>
            <input
              type="text"
              placeholder="Search topic or concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-apt-surface-mid border border-apt-outline-dim rounded-lg text-sm text-apt-text placeholder-apt-text-dim focus:outline-none focus:border-apt-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-apt-text-dim font-medium mr-1">Difficulty:</span>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setActiveDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeDifficultyFilter === diff
                    ? 'bg-apt-primary/20 text-apt-primary border border-apt-primary/40'
                    : 'bg-apt-surface-mid text-apt-text-dim hover:text-apt-text border border-apt-outline-dim'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => {
            const isSelected = selectedTopic === topic.id;
            const topicProgressKey = `${topic.category}:${topic.id}`;
            const topicMetric = userTopicsProgress[topicProgressKey] || { attempted: 0, correct: 0, accuracy: 0, progress: 0 };
            const solved = topicMetric.attempted || 0;
            const accuracy = topicMetric.accuracy || 0;

            return (
              <div
                key={topic.id}
                onClick={() => handleSelectTopic(topic)}
                className={`group relative bg-apt-surface-mid rounded-xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-apt-primary ring-2 ring-apt-primary/30 shadow-lg bg-apt-surface-high'
                    : 'border-apt-outline-dim hover:border-apt-outline hover:bg-apt-surface-high'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-apt-surface-low border border-apt-outline-dim flex items-center justify-center text-apt-primary">
                      <span className="material-symbols-outlined text-xl">{topic.icon || 'quiz'}</span>
                    </div>

                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      topic.difficulty === 'Easy'
                        ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                        : topic.difficulty === 'Medium'
                        ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                        : 'text-rose-400 bg-rose-400/10 border-rose-400/20'
                    }`}>
                      {topic.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-apt-text group-hover:text-apt-primary transition-colors">
                    {topic.name}
                  </h3>

                  <p className="text-xs text-apt-text-dim mt-2 leading-relaxed line-clamp-2">
                    {topic.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {topic.tags?.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-apt-surface-low border border-apt-outline-dim/60 text-apt-text-dim">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-apt-outline-dim/40 flex items-center justify-between text-xs text-apt-text-dim">
                  <div>
                    Solved: <b className="text-apt-text font-family-jetbrains">{solved}</b>
                  </div>
                  <div>
                    Accuracy: <b className="text-emerald-400 font-family-jetbrains">{accuracy}%</b>
                  </div>
                  <div className="text-apt-primary font-semibold flex items-center gap-0.5">
                    <span>Select</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 6. Sticky Bottom Action Bar when a topic is selected */}
        {selectedTopic && (
          <div className="fixed bottom-0 inset-x-0 bg-apt-surface-top/95 backdrop-blur-md border-t border-apt-outline py-4 px-4 sm:px-8 z-40 shadow-2xl">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-apt-primary/20 text-apt-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">{selectedTopicData?.icon || 'check_circle'}</span>
                </div>
                <div>
                  <div className="text-xs text-apt-text-dim uppercase tracking-wider font-semibold">Selected Topic</div>
                  <div className="text-base font-bold text-apt-text">{selectedTopicData?.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleConfigureSetup}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-apt-primary-ctr text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all cursor-pointer"
                >
                  <span>Configure Test Setup</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
