import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAptitude } from '../context/aptitudeContext';
import { topicsData, categoriesData } from '../data/topicsData';
import {
  Home,
  History,
  Search,
  ArrowRight,
  Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Badge, Input } from '@/components/ui';
import { companyProfiles, getCompanyOptions, getCompanyProfile } from '../../config/companyProfiles';

export default function TopicSelection() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, dispatch, fetchProgress } = useAptitude();
  const { selectedTopic } = state;

  const initialCategory = searchParams.get('category') || state.selectedCategory || 'quantitative';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDifficultyFilter, setActiveDifficultyFilter] = useState('All');

  const companyOptions = useMemo(() => getCompanyOptions(), []);
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => {
    if (!state.targetCompany) return '';
    const match = Object.values(companyProfiles).find(
      (p) => p.name.toLowerCase() === state.targetCompany.toLowerCase()
    );
    return match ? match.id : 'other';
  });
  const [customCompany, setCustomCompany] = useState(() => {
    if (!state.targetCompany) return '';
    const match = Object.values(companyProfiles).find(
      (p) => p.name.toLowerCase() === state.targetCompany.toLowerCase()
    );
    return match ? '' : state.targetCompany;
  });

  const effectiveCompany = selectedCompanyId === 'other' ? customCompany.trim() : (companyProfiles[selectedCompanyId]?.name || '');
  const activeProfile = selectedCompanyId ? getCompanyProfile(selectedCompanyId, customCompany) : null;

  const handleCompanyChange = (e) => {
    const newId = e.target.value;
    setSelectedCompanyId(newId);
    if (!newId) {
      dispatch({ type: 'SET_TARGET_COMPANY', payload: null });
    } else if (newId === 'other') {
      dispatch({ type: 'SET_TARGET_COMPANY', payload: customCompany.trim() || null });
    } else {
      const prof = companyProfiles[newId];
      dispatch({ type: 'SET_TARGET_COMPANY', payload: prof?.name || null });
      if (prof?.aptitudeStyle?.difficultyDefault) {
        dispatch({ type: 'SET_DIFFICULTY', payload: prof.aptitudeStyle.difficultyDefault });
      }
    }
  };

  const handleCustomCompanyChange = (e) => {
    const val = e.target.value;
    setCustomCompany(val);
    dispatch({ type: 'SET_TARGET_COMPANY', payload: val.trim() || null });
  };

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
      if (activeCategory !== 'all' && topic.category !== activeCategory) {
        return false;
      }
      const matchesSearch =
        topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

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
    description: 'Explore the complete aptitude syllabus across all testing domains.',
  };

  return (
    <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Breadcrumb Rail */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <nav className="flex items-center space-x-2 text-xs font-medium text-[#94A3B8]">
            <Link to="/" className="hover:text-[#F1F5F9] transition-colors flex items-center gap-1">
              <Home size={14} />
              <span>Home</span>
            </Link>
            <span>/</span>
            <Link to="/aptitude" className="hover:text-[#F1F5F9] transition-colors">
              Aptitude Hub
            </Link>
            <span>/</span>
            <span className="text-[#38BDF8] font-semibold">{activeCategoryObj.name}</span>
          </nav>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={History}
            onClick={() => navigate('/history')}
          >
            Past Attempts
          </Button>
        </div>

        {/* 2. Header Section */}
        <div className="bg-[#0E131F] rounded-2xl p-6 sm:p-8 border border-[#1E2B45] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="sm">
                SYLLABUS EXPLORER
              </Badge>
              <span className="text-xs font-mono text-[#64748B] tabular-nums">
                {filteredTopics.length} Topics Available
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
              {activeCategoryObj.name}
            </h1>
            <p className="text-[#94A3B8] text-xs sm:text-sm leading-relaxed">
              {activeCategoryObj.description}
            </p>
          </div>
        </div>

        {/* Target Company Selector & Recommendations (Optional) */}
        <div className="bg-[#0A0D14] rounded-2xl p-5 border border-[#1E2B45] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-medium text-[#94A3B8] flex items-center gap-1.5 mb-1">
                <Building2 size={14} className="text-[#38BDF8]" />
                <span>Target Company (Optional)</span>
              </label>
              <p className="text-[11px] text-[#64748B]">
                Tailor topic recommendations and question calibration to match known company assessment patterns.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:w-72 shrink-0">
              <select
                value={selectedCompanyId}
                onChange={handleCompanyChange}
                className="w-full h-9 px-3 rounded-lg bg-[#0E131F] border border-[#1E2B45] text-xs text-[#F1F5F9] outline-none cursor-pointer focus:border-[#3B82F6] transition-colors"
              >
                <option value="">None (General Practice)</option>
                {companyOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name} ({opt.category === 'product' ? 'Product' : opt.category === 'service' ? 'Service' : opt.category === 'startup' ? 'Startup' : 'Custom'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <AnimatePresence>
            {selectedCompanyId === 'other' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <Input
                  leftIcon={Building2}
                  placeholder="Enter company name (e.g. Deloitte, Goldman Sachs)"
                  value={customCompany}
                  onChange={handleCustomCompanyChange}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Company Recommendation Card & Disclaimer */}
          {activeProfile && (effectiveCompany || selectedCompanyId !== 'other') && (
            <div className="p-3.5 rounded-xl bg-[#0E131F] border border-[#1E2B45]/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-xs font-semibold text-[#F1F5F9] shrink-0">
                    {activeProfile.name} Aptitude Focus:
                  </span>
                  <span className="text-xs text-[#94A3B8]">
                    {activeProfile.aptitudeStyle?.focus}
                  </span>
                </div>
                {activeProfile.category === 'product' && (
                  <Link
                    to="/interview"
                    className="text-xs text-[#38BDF8] hover:text-[#60A5FA] flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>Try Mock Interview instead</span>
                    <ArrowRight size={12} />
                  </Link>
                )}
              </div>

              {activeProfile.category === 'product' && (
                <p className="text-[11px] text-[#94A3B8] bg-[#141B2D] p-2.5 rounded-lg border border-[#1E2B45]">
                  Note: {activeProfile.name} typically emphasizes technical problem-solving and coding interviews over standalone aptitude rounds. You can practice general aptitude here, or practice role-specific technical questions in the Mock Interview module.
                </p>
              )}

              {activeProfile.aptitudeStyle?.recommendedTopics?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-[#64748B] mr-1">Recommended focus areas:</span>
                  {activeProfile.aptitudeStyle.recommendedTopics.map((slugOrId) => {
                    const catObj = categoriesData.find((c) => c.slug === slugOrId);
                    const topObj = topicsData.find((t) => t.id === slugOrId);
                    const label = catObj?.name || topObj?.name || slugOrId;

                    return (
                      <button
                        key={slugOrId}
                        onClick={() => {
                          if (catObj) {
                            handleCategoryTab(catObj.slug);
                          } else if (topObj) {
                            handleSelectTopic(topObj);
                          }
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                          (catObj && activeCategory === catObj.slug) || (topObj && selectedTopic === topObj.id)
                            ? 'bg-[#2563EB]/20 border-[#2563EB] text-[#93C5FD]'
                            : 'bg-[#141B2D] border-[#1E2B45] text-[#94A3B8] hover:text-[#F1F5F9]'
                        }`}
                      >
                        {label} {catObj ? '(Category)' : ''}
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="text-[10px] text-[#64748B] italic leading-tight">
                Question style is adapted to match {activeProfile.name}'s general aptitude approach — not affiliated with or endorsed by {activeProfile.name}.
              </p>
            </div>
          )}
        </div>

        {/* 3. Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#161F33]">
          {categoriesData.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => handleCategoryTab(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#141B2D] text-[#F1F5F9] border border-[#2D3E63] shadow-sm'
                    : 'bg-[#0A0D14] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0E131F] border border-[#161F33]'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Search & Filter Bar */}
        <div className="bg-[#0A0D14] rounded-xl p-4 border border-[#161F33] flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="w-full md:w-80">
            <Input
              leftIcon={Search}
              placeholder="Search topic or concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8] font-medium mr-1">Difficulty:</span>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setActiveDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeDifficultyFilter === diff
                    ? 'bg-[#141B2D] text-[#F1F5F9] border border-[#2D3E63]'
                    : 'bg-[#0E131F] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#161F33]'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className={`bg-[#0E131F] rounded-xl p-5 border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#2563EB] ring-2 ring-[#2563EB]/30 bg-[#141B2D]'
                    : 'border-[#1E2B45] hover:border-[#2D3E63] hover:bg-[#141B2D]/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant={
                        topic.difficulty === 'Easy'
                          ? 'success'
                          : topic.difficulty === 'Medium'
                          ? 'warning'
                          : 'error'
                      }
                      size="sm"
                    >
                      {topic.difficulty || 'Medium'}
                    </Badge>
                    <span className="text-[11px] font-mono text-[#64748B]">
                      {topic.questionCount || 10} Questions
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9] mb-1.5">
                    {topic.name}
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2 mb-4">
                    {topic.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#161F33] flex items-center justify-between text-xs">
                  <div className="text-[11px] text-[#64748B] font-mono tabular-nums">
                    <span>Solved: {solved}</span>
                    {solved > 0 && <span className="ml-2 text-[#34D399]">Acc: {accuracy}%</span>}
                  </div>
                  <span className="text-xs font-semibold text-[#38BDF8]">
                    {isSelected ? 'Selected ✓' : 'Select →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Action Bar for Selected Topic */}
      {selectedTopic && (
        <div className="fixed bottom-6 inset-x-4 max-w-xl mx-auto z-40">
          <div className="bg-[#0E131F] border border-[#2563EB] rounded-2xl p-4 shadow-2xl shadow-black/80 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#38BDF8] block">Topic Selected</span>
              <h4 className="text-sm font-bold text-[#F1F5F9] truncate max-w-xs">
                {selectedTopicData?.name}
              </h4>
            </div>

            <Button
              variant="primary"
              size="md"
              rightIcon={ArrowRight}
              onClick={handleConfigureSetup}
            >
              Configure Practice Drill
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
