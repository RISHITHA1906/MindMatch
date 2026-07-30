import React, { useState, useMemo, useCallback } from 'react';
import { EDUCATION_DATA } from '../utils/educationData';

// ─────────────────────────────────────────────────────────────────
// EduSelector — Browse/search and pick skills from India edu tree.
// CRITICAL: Every interactive element uses type="button" explicitly
// so it NEVER accidentally submits a parent <form>.
// ─────────────────────────────────────────────────────────────────
export default function EduSelector({ selected = [], onChange, accentColor }) {
  const [search, setSearch] = useState('');
  const [openCats, setOpenCats] = useState({});   // { catName: bool }
  const [openSubs, setOpenSubs] = useState({});   // { "cat|||sub": bool }

  const accent = accentColor || 'var(--accent-lavender)';

  // Toggle a skill in/out of selected list
  const toggle = useCallback((val) => {
    if (selected.includes(val)) {
      onChange(selected.filter(x => x !== val));
    } else {
      onChange([...selected, val]);
    }
  }, [selected, onChange]);

  // Toggle category accordion
  const toggleCat = useCallback((cat) => {
    setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  // Toggle subcategory accordion
  const toggleSub = useCallback((key) => {
    setOpenSubs(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Filtered data based on search
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null; // null means show accordion (no search active)
    const result = {};
    Object.entries(EDUCATION_DATA).forEach(([cat, subs]) => {
      Object.entries(subs).forEach(([sub, items]) => {
        const matched = items.filter(i =>
          i.toLowerCase().includes(q) ||
          sub.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q)
        );
        if (matched.length) {
          if (!result[cat]) result[cat] = {};
          result[cat][sub] = matched;
        }
      });
    });
    return result;
  }, [search]);

  const isSearching = search.trim().length > 0;
  const displayData = isSearching ? filteredData : EDUCATION_DATA;
  const noResults = isSearching && (!displayData || Object.keys(displayData).length === 0);

  return (
    <div>
      {/* Selected tags */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {selected.map(s => (
            <span key={s} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem', fontWeight: 600,
              background: accent.replace(')', ', 0.15)').replace('var', '').replace('(', '') || 'rgba(179,157,219,0.15)',
              color: 'var(--text-primary)',
              border: '1.5px solid var(--border)',
            }}>
              {s}
              {/* type="button" prevents form submission */}
              <button
                type="button"
                onClick={() => toggle(s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', padding: 0, color: 'inherit', lineHeight: 1, opacity: 0.7 }}
              >✕</button>
            </span>
          ))}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)' }}
            >Clear all</button>
          )}
        </div>
      )}

      {/* Search */}
      <input
        className="input-field"
        placeholder="🔍 Search exams, subjects, skills... (e.g. JEE, Python, SSC CGL)"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 8 }}
      />

      {/* Count */}
      {selected.length > 0 && (
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 6 }}>
          ✅ {selected.length} selected
        </div>
      )}

      {/* Tree */}
      <div style={{
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        maxHeight: 340,
        overflowY: 'auto',
        background: 'var(--bg-input)',
      }}>
        {noResults && (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No results for "{search}" — try a shorter keyword
          </div>
        )}

        {displayData && Object.entries(displayData).map(([cat, subs]) => {
          const catOpen = openCats[cat] || isSearching;
          return (
            <div key={cat} style={{ borderBottom: '1px solid var(--border)' }}>
              {/* Category header — type="button" is CRITICAL here */}
              <button
                type="button"
                onClick={() => toggleCat(cat)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 14px',
                  background: catOpen ? 'var(--bg-hover)' : 'transparent',
                  border: 'none', borderBottom: catOpen ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.83rem',
                  color: 'var(--text-primary)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'background 0.15s',
                }}
              >
                <span>{cat}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                  {catOpen ? '▲' : '▼'}
                </span>
              </button>

              {catOpen && Object.entries(subs).map(([sub, items]) => {
                const subKey = `${cat}|||${sub}`;
                const subOpen = openSubs[subKey] || isSearching;
                return (
                  <div key={sub}>
                    {/* Subcategory header — type="button" CRITICAL */}
                    <button
                      type="button"
                      onClick={() => toggleSub(subKey)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '7px 20px',
                        background: 'var(--bg-hover)',
                        border: 'none', borderBottom: '1px solid var(--border)',
                        cursor: 'pointer', fontSize: '0.79rem',
                        fontWeight: 600, color: 'var(--text-secondary)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      <span>{sub}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {subOpen ? '▲' : '▼'}
                      </span>
                    </button>

                    {subOpen && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '8px 20px 10px' }}>
                        {items.map(item => {
                          const sel = selected.includes(item);
                          return (
                            /* Each item chip — type="button" CRITICAL */
                            <button
                              key={item}
                              type="button"
                              onClick={() => toggle(item)}
                              style={{
                                padding: '4px 11px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                border: sel ? '2px solid var(--primary)' : '1px solid var(--border)',
                                background: sel ? 'var(--primary)' : 'var(--bg-card)',
                                color: sel ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: sel ? 700 : 400,
                                fontFamily: 'var(--font-body)',
                                transition: 'all 0.15s',
                                lineHeight: 1.4,
                              }}
                            >
                              {sel ? '✓ ' : ''}{item}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {!isSearching && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 5 }}>
          💡 Click a category to expand → click subcategory → select items
        </div>
      )}
    </div>
  );
}
