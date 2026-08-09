import React, { useState, useEffect, useCallback } from 'react';
import { getPracticeHistory } from '../services/practiceService';
import { getAllClassSubjects } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { getDecodedToken } from '../utils/authHelper';

// Category Emojis & Theme Configuration
const CATEGORY_CONFIG = {
  '⚔️ Daily Challenges': { emoji: '⚔️', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  IoT: { emoji: '🌐', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  'IoT (Internet of Things)': { emoji: '🌐', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  'Computer Science': { emoji: '💻', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  Mathematics: { emoji: '📐', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  Physics: { emoji: '⚛️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  Chemistry: { emoji: '🧪', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  Biology: { emoji: '🧬', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  English: { emoji: '📖', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  History: { emoji: '🏛️', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
};

// Default Sample Mock Tests for Demonstration if History is Empty
const SAMPLE_MOCK_TESTS = [
  {
    id: 'sample-daily-1',
    subjectName: '⚔️ Daily Challenges',
    moduleName: 'Daily AI Challenge: Machine Learning & Weak Topic Reinforcement',
    topic: 'Daily Challenge - AI Scan',
    difficulty: 'HARD',
    score: 80,
    totalQuestions: 10,
    correctAnswers: 8,
    wrongAnswers: 2,
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'sample-iot-1',
    subjectName: 'IoT',
    moduleName: 'Module 2: Wireless Sensor Networks & Microcontrollers (Capstone)',
    topic: 'IoT - Embedded Sensors',
    difficulty: 'MEDIUM',
    score: 90,
    totalQuestions: 10,
    correctAnswers: 9,
    wrongAnswers: 1,
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'sample-math-1',
    subjectName: 'Mathematics',
    moduleName: 'Unit 1: Differential Calculus & Integration Derivatives',
    topic: 'Mathematics - Calculus',
    difficulty: 'HARD',
    score: 70,
    totalQuestions: 10,
    correctAnswers: 7,
    wrongAnswers: 3,
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

const Practice = () => {
  const navigate = useNavigate();
  const userId = getDecodedToken()?.userId || 1;

  const [history, setHistory] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});

  // Fetch Student's Enrolled Class Subjects
  useEffect(() => {
    const fetchClassSubjects = async () => {
      try {
        const decoded = getDecodedToken();
        const classroomId = decoded?.classroomId;
        const res = await getAllClassSubjects();
        let all = res.data || [];
        if (classroomId) {
          all = all.filter((cs) => cs.classroomId === classroomId);
        }
        setClassSubjects(all);
      } catch (err) {
        console.error('Error fetching student class subjects:', err);
      }
    };
    fetchClassSubjects();
  }, []);

  // Fetch Practice History from API
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPracticeHistory(userId);
      if (data && data.length > 0) {
        setHistory(data);
      } else {
        setHistory(SAMPLE_MOCK_TESTS);
      }
    } catch (err) {
      console.error('Error loading practice history:', err);
      setHistory(SAMPLE_MOCK_TESTS);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Dynamic Subject Resolution Function
  const getCategoryForRecord = (rec) => {
    const str = `${rec.subjectName || ''} ${rec.moduleName || ''} ${rec.topic || ''}`.toLowerCase();

    // 1. Daily Challenges
    if (
      str.includes('daily') ||
      str.includes('challenge') ||
      str.includes('mission') ||
      str.includes('boss') ||
      str.includes('arena')
    ) {
      return '⚔️ Daily Challenges';
    }

    // 2. Direct ClassSubjectId Match
    if (rec.classSubjectId) {
      const match = classSubjects.find((cs) => cs.classSubjectId === rec.classSubjectId);
      if (match && match.subjectName) return match.subjectName;
    }

    // 3. Direct subjectName property
    if (rec.subjectName && rec.subjectName !== 'General Practice' && rec.subjectName !== 'Computer Science') {
      return rec.subjectName;
    }

    // 4. Keyword Checks for IoT & Academic Subjects
    if (
      str.includes('iot') ||
      str.includes('internet of things') ||
      str.includes('sensor') ||
      str.includes('embedded') ||
      str.includes('capstone') ||
      str.includes('captone') ||
      str.includes('module')
    ) {
      // Return student's enrolled subject name if available (e.g. IoT)
      const iotSub = classSubjects.find((cs) => cs.subjectName && cs.subjectName.toLowerCase().includes('iot'));
      return iotSub ? iotSub.subjectName : 'IoT';
    }

    if (str.includes('math') || str.includes('calculus') || str.includes('algebra') || str.includes('matrix')) {
      return 'Mathematics';
    }

    if (str.includes('physic') || str.includes('mechanic') || str.includes('motion')) {
      return 'Physics';
    }

    if (str.includes('chem') || str.includes('organic') || str.includes('acid')) {
      return 'Chemistry';
    }

    if (str.includes('bio') || str.includes('cell') || str.includes('genetics')) {
      return 'Biology';
    }

    // 5. Fallback to student's enrolled subject if present
    if (classSubjects.length > 0 && classSubjects[0].subjectName) {
      return classSubjects[0].subjectName; // Resolves to student's subject (IoT)
    }

    return 'IoT';
  };

  // Group History by Subject Category
  const groupedHistory = React.useMemo(() => {
    const groups = {};
    history.forEach((rec) => {
      const cat = getCategoryForRecord(rec);
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(rec);
    });
    return groups;
  }, [history, classSubjects]);

  // Calculate Summaries per Category
  const categorySummaries = React.useMemo(() => {
    const summaries = [];
    const categoryKeys = Object.keys(groupedHistory).sort((a, b) => {
      if (a === '⚔️ Daily Challenges') return -1;
      if (b === '⚔️ Daily Challenges') return 1;
      return a.localeCompare(b);
    });

    categoryKeys.forEach((cat) => {
      const records = groupedHistory[cat];
      const totalTests = records.length;
      const totalPct = records.reduce((acc, r) => {
        const pct = r.score > 10 ? r.score : (r.score / (r.totalQuestions || 10)) * 100;
        return acc + pct;
      }, 0);
      const avgScorePct = Math.round(totalPct / totalTests);
      summaries.push({
        categoryName: cat,
        totalTests,
        avgScorePct,
        records,
      });
    });
    return summaries;
  }, [groupedHistory]);

  const toggleCategoryExpand = (catName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: prev[catName] === undefined ? true : !prev[catName],
    }));
  };

  // Filter Categories
  const filteredCategories = categorySummaries.filter((cat) => {
    if (selectedCategoryFilter !== 'ALL' && cat.categoryName !== selectedCategoryFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchCategory = cat.categoryName.toLowerCase().includes(q);
      const matchTopic = cat.records.some(
        (r) => (r.moduleName && r.moduleName.toLowerCase().includes(q)) || (r.topic && r.topic.toLowerCase().includes(q))
      );
      return matchCategory || matchTopic;
    }
    return true;
  });

  const totalMockTestsTaken = history.length;
  const overallAvgScore = history.length
    ? Math.round(
        history.reduce((acc, r) => acc + (r.score > 10 ? r.score : (r.score / (r.totalQuestions || 10)) * 100), 0) /
          history.length
      )
    : 0;

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', paddingBottom: 60, fontFamily: "'Inter', sans-serif" }}>
      {/* Top Banner & Quick Actions */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b, #334155)',
          borderRadius: 24,
          padding: '32px 36px',
          color: 'white',
          marginBottom: 28,
          boxShadow: '0 16px 36px rgba(15,23,42,0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                fontSize: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              📊
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: '-0.02em', fontFamily: "'Outfit', sans-serif" }}>
              Practice & Assessment Center
            </h1>
          </div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>
            Subject-wise breakdown of all AI Mock Tests & Daily Challenges taken.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/student/daily-challenge')}
            style={{
              padding: '12px 20px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(239,68,68,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            ⚔️ Take Daily Challenge
          </button>

          <button
            onClick={() => navigate('/student/syllabus')}
            style={{
              padding: '12px 20px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            📚 Browse Syllabus Units
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            background: 'var(--surface-1)',
            borderRadius: 20,
            padding: 20,
            border: '1px solid var(--border-light)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'rgba(59,130,246,0.1)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            📝
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{totalMockTestsTaken}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', marginTop: 4 }}>Total Tests Evaluated</div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface-1)',
            borderRadius: 20,
            padding: 20,
            border: '1px solid var(--border-light)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'rgba(16,185,129,0.1)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            🎯
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{overallAvgScore}%</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', marginTop: 4 }}>Overall Average Accuracy</div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface-1)',
            borderRadius: 20,
            padding: 20,
            border: '1px solid var(--border-light)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'rgba(139,92,246,0.1)',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            📚
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
              {categorySummaries.length}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', marginTop: 4 }}>Subjects Tracked</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          background: 'var(--surface-1)',
          borderRadius: 20,
          padding: 20,
          border: '1px solid var(--border-light)',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search tests by topic or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            border: '1px solid var(--border-medium)',
            background: 'var(--surface-2)',
            color: 'var(--text-primary)',
            fontSize: 13,
            fontWeight: 600,
            minWidth: 260,
            outline: 'none',
          }}
        />

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedCategoryFilter('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: 'none',
              background: selectedCategoryFilter === 'ALL' ? '#1e293b' : 'var(--surface-2)',
              color: selectedCategoryFilter === 'ALL' ? 'white' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            All Categories
          </button>

          {categorySummaries.map((catSummary) => {
            const conf = CATEGORY_CONFIG[catSummary.categoryName] || {
              emoji: '🌐',
              color: '#10b981',
              bg: 'rgba(16,185,129,0.1)',
            };
            const active = selectedCategoryFilter === catSummary.categoryName;
            return (
              <button
                key={catSummary.categoryName}
                onClick={() => setSelectedCategoryFilter(catSummary.categoryName)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: active ? `2px solid ${conf.color}` : 'none',
                  background: active ? conf.bg : 'var(--surface-2)',
                  color: active ? conf.color : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>{conf.emoji}</span> {catSummary.categoryName} ({catSummary.totalTests})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Category List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>Loading evaluation history...</div>
      ) : filteredCategories.length === 0 ? (
        <div
          style={{
            background: 'var(--surface-1)',
            borderRadius: 24,
            padding: 48,
            textAlign: 'center',
            border: '2px dashed var(--border-medium)',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>No Tests Found</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
            Take a Daily Challenge or start a Syllabus Mock Test to log progress.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {filteredCategories.map((catSummary) => {
            const conf = CATEGORY_CONFIG[catSummary.categoryName] || {
              emoji: '🌐',
              color: '#10b981',
              bg: 'rgba(16,185,129,0.1)',
            };
            const isExpanded = expandedCategories[catSummary.categoryName] !== false;

            return (
              <div
                key={catSummary.categoryName}
                style={{
                  background: 'var(--surface-1)',
                  borderRadius: 24,
                  border: '1px solid var(--border-light)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                }}
              >
                {/* Subject Category Header Bar */}
                <div
                  onClick={() => toggleCategoryExpand(catSummary.categoryName)}
                  style={{
                    padding: '20px 24px',
                    background: catSummary.categoryName === '⚔️ Daily Challenges' ? 'rgba(239,68,68,0.04)' : 'var(--surface-2)',
                    borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: conf.bg,
                        color: conf.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                      }}
                    >
                      {conf.emoji}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                          {catSummary.categoryName}
                        </h3>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 8,
                            background: conf.bg,
                            color: conf.color,
                            fontWeight: 800,
                            fontSize: 11,
                          }}
                        >
                          {catSummary.totalTests} {catSummary.totalTests === 1 ? 'Test' : 'Tests'}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3, fontWeight: 500 }}>
                        Average Subject Accuracy:{' '}
                        <strong style={{ color: catSummary.avgScorePct >= 70 ? '#10b981' : '#f59e0b' }}>
                          {catSummary.avgScorePct}%
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Accordion Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 120, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ height: 6, borderRadius: 99, background: 'var(--border-medium)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${catSummary.avgScorePct}%`,
                            background: catSummary.avgScorePct >= 70 ? '#10b981' : '#f59e0b',
                            borderRadius: 99,
                          }}
                        />
                      </div>
                    </div>

                    <span style={{ fontSize: 16, color: 'var(--text-tertiary)', fontWeight: 800 }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Individual Test Attempts */}
                {isExpanded && (
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {catSummary.records.map((rec) => {
                      const pct = rec.score > 10 ? rec.score : Math.round((rec.score / (rec.totalQuestions || 10)) * 100);
                      const totalQ = rec.totalQuestions || 10;
                      const correctQ = rec.correctAnswers !== undefined ? rec.correctAnswers : Math.round((pct / 100) * totalQ);
                      const wrongQ = rec.wrongAnswers !== undefined ? rec.wrongAnswers : totalQ - correctQ;

                      const isExcellent = pct >= 80;
                      const isPass = pct >= 50 && pct < 80;

                      return (
                        <div
                          key={rec.id}
                          style={{
                            background: 'var(--surface-1)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: 16,
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 16,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {/* Details */}
                          <div style={{ flex: 1, minWidth: 240 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, mb: 4 }}>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  background:
                                    rec.difficulty === 'HARD'
                                      ? 'rgba(239,68,68,0.1)'
                                      : rec.difficulty === 'MEDIUM'
                                      ? 'rgba(245,158,11,0.1)'
                                      : 'rgba(16,185,129,0.1)',
                                  color:
                                    rec.difficulty === 'HARD'
                                      ? '#ef4444'
                                      : rec.difficulty === 'MEDIUM'
                                      ? '#f59e0b'
                                      : '#10b981',
                                }}
                              >
                                {rec.difficulty || 'MEDIUM'}
                              </span>

                              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                                {new Date(rec.timestamp || Date.now()).toLocaleString()}
                              </span>
                            </div>

                            <h4 style={{ margin: '4px 0 2px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                              {rec.moduleName || rec.topic || 'Assessment Attempt'}
                            </h4>

                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 12, mt: 4 }}>
                              <span style={{ color: '#10b981', fontWeight: 700 }}>✓ {correctQ} Correct</span>
                              <span style={{ color: '#ef4444', fontWeight: 700 }}>✕ {wrongQ} Incorrect</span>
                              <span style={{ color: 'var(--text-tertiary)' }}>Total: {totalQ} Qs</span>
                            </div>
                          </div>

                          {/* Score & Retake Action */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ textAlign: 'right' }}>
                              <div
                                style={{
                                  fontSize: 20,
                                  fontWeight: 900,
                                  color: isExcellent ? '#10b981' : isPass ? '#f59e0b' : '#ef4444',
                                  lineHeight: 1,
                                }}
                              >
                                {pct}%
                              </div>
                              <span
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 800,
                                  color: isExcellent ? '#047857' : isPass ? '#b45309' : '#b91c1c',
                                }}
                              >
                                {isExcellent ? '🟢 Mastery' : isPass ? '🟡 Satisfactory' : '🔴 Needs Practice'}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                if (catSummary.categoryName === '⚔️ Daily Challenges') {
                                  navigate('/student/daily-challenge');
                                } else {
                                  navigate('/student/syllabus');
                                }
                              }}
                              style={{
                                padding: '8px 14px',
                                borderRadius: 10,
                                background: 'var(--surface-3)',
                                border: '1px solid var(--border-medium)',
                                color: 'var(--text-primary)',
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              Retake 🔄
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Practice;
