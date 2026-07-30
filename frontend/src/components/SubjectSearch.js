import React, { useState, useRef, useMemo } from 'react';
import { SUBJECT_SUGGESTIONS_BY_CONTEXT } from '../utils/educationData';

// ─────────────────────────────────────────────────────────────────
// SubjectSearch — Type-ahead input for specific subject/topic entry.
// Shows suggestions based on the 'context' prop (selected exams/skills).
// ALL buttons are type="button" — no accidental form submission.
// ─────────────────────────────────────────────────────────────────

const GENERAL_SUGGESTIONS = [
  // Maths
  'Algebra', 'Calculus', 'Trigonometry', 'Statistics', 'Probability',
  'Matrices', 'Vectors', 'Integration', 'Differentiation', 'Permutations & Combinations',
  'Coordinate Geometry', 'Complex Numbers', 'Number Theory', 'Linear Algebra',
  // Physics
  'Mechanics', 'Thermodynamics', 'Optics', 'Electrostatics', 'Magnetism',
  'Modern Physics', 'Waves & Oscillations', 'Gravitation', 'Semiconductors',
  // Chemistry
  'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry',
  'Electrochemistry', 'Chemical Bonding', 'Thermochemistry',
  'Coordination Compounds', 'Hydrocarbons', 'Polymers', 'Biomolecules',
  // Biology
  'Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Physiology',
  'Plant Physiology', 'Biotechnology', 'Reproduction', 'Microbes', 'Biodiversity',
  // CS/Tech
  'Data Structures', 'Algorithms', 'Dynamic Programming', 'Recursion',
  'Graph Theory', 'Trees', 'Linked Lists', 'Arrays', 'Hashing',
  'Operating Systems', 'DBMS Concepts', 'Computer Networks', 'OOP Concepts',
  'System Design', 'SQL Queries', 'REST APIs',
  // UPSC/SSC
  'Indian History', 'Indian Polity', 'Indian Economy', 'Geography of India',
  'Physical Geography', 'Environment & Ecology', 'Current Affairs',
  'International Relations', 'Science & Technology UPSC',
  // Aptitude
  'Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability',
  'Data Interpretation', 'General Knowledge',
  // Electrical/ECE
  'Circuit Analysis', 'Power Systems', 'Control Systems',
  'Signals & Systems', 'Electromagnetic Fields',
  // Management
  'Financial Management', 'Marketing Management', 'Operations Management',
  'Business Law', 'Managerial Economics', 'Strategic Management',
];

export default function SubjectSearch({
  placeholder,
  selectedItems = [],
  onChangeItems,
  tagColor,
  context = [],            // Array of selected EduSelector items (for context-aware suggestions)
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef();

  // Build context-aware suggestions from selected exams/skills
  const contextSuggestions = useMemo(() => {
    const suggestions = new Set();
    context.forEach(item => {
      // Try exact key match
      if (SUBJECT_SUGGESTIONS_BY_CONTEXT[item]) {
        SUBJECT_SUGGESTIONS_BY_CONTEXT[item].forEach(s => suggestions.add(s));
      } else {
        // Partial key match
        Object.entries(SUBJECT_SUGGESTIONS_BY_CONTEXT).forEach(([key, vals]) => {
          if (key.toLowerCase().includes(item.toLowerCase()) ||
              item.toLowerCase().includes(key.toLowerCase())) {
            vals.forEach(s => suggestions.add(s));
          }
        });
      }
    });
    // Add general suggestions
    GENERAL_SUGGESTIONS.forEach(s => suggestions.add(s));
    return [...suggestions];
  }, [context]);

  // Filter suggestions by query
  const filtered = useMemo(() => {
    if (!query.trim()) {
      // Show context-first suggestions when no query
      const ctx = context.flatMap(item =>
        (SUBJECT_SUGGESTIONS_BY_CONTEXT[item] || []).filter(s => !selectedItems.includes(s))
      );
      return [...new Set(ctx)].slice(0, 12);
    }
    const q = query.toLowerCase();
    const results = contextSuggestions.filter(s =>
      s.toLowerCase().includes(q) && !selectedItems.includes(s)
    );
    const typed = query.trim();
    if (typed && !selectedItems.includes(typed) && !results.find(r => r.toLowerCase() === typed.toLowerCase())) {
      results.unshift(`Add "${typed}"`);
    }
    return results.slice(0, 10);
  }, [query, contextSuggestions, selectedItems, context]);

  const add = (item) => {
    const cleaned = item.startsWith('Add "') ? item.slice(5, -1) : item;
    const trimmed = cleaned.trim();
    if (trimmed && !selectedItems.includes(trimmed)) {
      onChangeItems([...selectedItems, trimmed]);
    }
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const remove = (item) => onChangeItems(selectedItems.filter(s => s !== item));

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && query.trim()) {
      e.preventDefault();
      add(query);
    }
    if (e.key === 'Backspace' && !query && selectedItems.length > 0) {
      remove(selectedItems[selectedItems.length - 1]);
    }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Tags + input box */}
      <div
        onClick={() => { inputRef.current?.focus(); setOpen(true); }}
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 5, padding: '8px 10px',
          background: 'var(--bg-input)', border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)', cursor: 'text', minHeight: 46,
          alignItems: 'center', transition: 'border-color 0.2s',
        }}
      >
        {selectedItems.map(s => (
          <span key={s} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 'var(--radius-full)',
            background: tagColor || 'var(--accent-pink)',
            fontSize: '0.75rem', fontWeight: 600,
            color: 'var(--text-primary)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            {s}
            {/* type="button" CRITICAL — no form submit */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(s); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', padding: 0, color: 'inherit', lineHeight: 1, opacity: 0.7 }}
            >✕</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          placeholder={selectedItems.length === 0
            ? (placeholder || 'Type a subject, topic, or chapter and press Enter...')
            : '+ Add more specific topics...'}
          style={{
            flex: 1, minWidth: 120, border: 'none', background: 'transparent',
            outline: 'none', fontSize: '0.87rem', color: 'var(--text-primary)',
            padding: '2px 0', fontFamily: 'var(--font-body)',
          }}
        />
      </div>

      {/* Context hint */}
      {context.length > 0 && selectedItems.length === 0 && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
          💡 Showing topics related to: {context.slice(0, 3).join(', ')}{context.length > 3 ? ` +${context.length - 3} more` : ''}. Type to search or press ↓
        </div>
      )}

      {/* Suggestions dropdown */}
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', zIndex: 200,
          boxShadow: 'var(--shadow-lg)', overflow: 'hidden', maxHeight: 260, overflowY: 'auto',
        }}>
          {!query && context.length > 0 && (
            <div style={{ padding: '6px 12px', fontSize: '0.71rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-hover)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📌 Suggested for your selected exams/skills
            </div>
          )}
          {filtered.map((s, i) => (
            // type="button" on mousedown-based selection isn't needed here (it's a div),
            // but we stop propagation to avoid blur hiding dropdown before click registers
            <div
              key={s}
              onMouseDown={(e) => { e.preventDefault(); add(s); }}
              style={{
                padding: '9px 14px', cursor: 'pointer',
                fontSize: '0.85rem', color: 'var(--text-primary)',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '0.8rem' }}>
                {s.startsWith('Add "') ? '➕' : '📌'}
              </span>
              {s}
            </div>
          ))}
          <div style={{ padding: '5px 14px', fontSize: '0.71rem', color: 'var(--text-muted)', background: 'var(--bg-hover)' }}>
            Press <strong>Enter</strong> or <strong>,</strong> to add · <strong>Backspace</strong> to remove last
          </div>
        </div>
      )}
    </div>
  );
}
