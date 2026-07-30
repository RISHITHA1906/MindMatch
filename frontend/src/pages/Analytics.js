import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Analytics() {
  const { user, API } = useAuth();
  const [stats, setStats] = useState(null);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    axios.get(`${API}/analytics/dashboard`).then(r => setStats(r.data)).catch(() => {});
    axios.get(`${API}/skills/all`).then(r => setSkills(r.data)).catch(() => {});
  }, [API]);

  return (
    <div style={{ padding: '28px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '6px' }}>📊 Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>Your learning journey stats and platform insights</p>
      </div>

      {/* My Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { ico: '💎', label: 'Skill Credits', val: stats?.skill_credits ?? user?.skill_credits, bg: 'var(--accent-yellow)' },
          { ico: '⭐', label: 'Reputation Score', val: `${stats?.reputation || 0}/5`, bg: 'var(--accent-lavender)' },
          { ico: '📅', label: 'Total Sessions', val: stats?.my_sessions ?? 0, bg: 'var(--accent-mint)' },
          { ico: '👥', label: 'Platform Users', val: stats?.total_users ?? 0, bg: 'var(--accent-sky)' },
        ].map(({ ico, label, val, bg }) => (
          <div key={label} className="card" style={{ background: bg, textAlign: 'center', border: 'none' }}>
            <div style={{ fontSize: '1.7rem', marginBottom: '6px' }}>{ico}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '2px' }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Mentor path */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '16px' }}>🏆 Mentor Progress</h3>
        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span>Reputation toward Mentor Tag</span>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{stats?.reputation || 0}/5 (need 4.5+)</span>
        </div>
        <div style={{ height: '10px', background: 'var(--border)', borderRadius: '5px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ height: '100%', width: `${Math.min(100, ((stats?.reputation || 0) / 5) * 100)}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '5px', transition: 'width 0.8s ease' }} />
        </div>
        {user?.mentor_tag && (
          <div style={{ background: 'var(--accent-mint)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '0.85rem', color: '#1a5a3a', fontWeight: 600 }}>
            🎉 You've earned the Professional Mentor tag! You qualify for special incentives.
          </div>
        )}
      </div>

      {/* Top skills chart */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '16px' }}>📊 Most Popular Skills on Platform</h3>
        {skills.slice(0, 10).map((s, i) => {
          const maxCount = skills[0]?.count || 1;
          const pct = (s.count / maxCount) * 100;
          const colors = ['var(--primary)','var(--secondary)','#4ade80','#f59e0b','#60a5fa','#f472b6','#34d399','#a78bfa','#fb7185','#38bdf8'];
          return (
            <div key={s.skill} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '20px' }}>#{i+1}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{s.skill}</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.count} {s.count === 1 ? 'learner' : 'learners'}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: colors[i % colors.length], borderRadius: '4px', transition: 'width 0.7s ease' }} />
              </div>
            </div>
          );
        })}
        {skills.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No skill data yet</p>}
      </div>
    </div>
  );
}
