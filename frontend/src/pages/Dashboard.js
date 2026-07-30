import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from '../components/notifications/NotificationPanel';

export default function Dashboard() {
  const { user, API } = useAuth();
  const navigate = useNavigate();
  const [stats,     setStats]     = useState(null);
  const [partners,  setPartners]  = useState([]);
  const [skillRecs, setSkillRecs] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    axios.get(`${API}/analytics/dashboard`).then(r => setStats(r.data)).catch(() => {});
    axios.get(`${API}/matching/partners`)
      .then(r => { setPartners(r.data.slice(0, 6)); setLoading(false); })
      .catch(() => setLoading(false));
    axios.get(`${API}/matching/skill-recommendations`).then(r => setSkillRecs(r.data.slice(0, 4))).catch(() => {});
  }, [API]);

  const matchColor = score => score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#e87aaa';
  const matchBg    = score => score >= 70 ? 'rgba(34,197,94,0.1)' : score >= 40 ? 'rgba(245,158,11,0.1)' : 'rgba(232,122,170,0.1)';

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1150 }}>

      {/* ── Header row with notification bell ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            Good day, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Your AI-matched study partners are waiting</p>
        </div>
        <NotificationPanel />
      </div>

      {/* ── Stats strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          ['💎', 'Skill Credits',   stats?.skill_credits ?? user?.skill_credits ?? 0, 'rgba(251,191,36,0.18)'],
          ['⭐', 'Reputation',      stats?.reputation ? `${stats.reputation}/5` : '–',  'rgba(179,157,219,0.18)'],
          ['📅', 'My Sessions',     stats?.my_sessions ?? 0,                            'rgba(128,203,196,0.18)'],
          ['👥', 'Total Learners',  stats?.total_users ?? 0,                            'rgba(56,189,248,0.18)'],
        ].map(([ico, lbl, val, bg]) => (
          <div key={lbl} style={{ background: bg, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{ico}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* ── Mentor tag ── */}
      {user?.mentor_tag && (
        <div style={{ background: 'linear-gradient(135deg,var(--accent-pink),var(--accent-lavender))', borderRadius: 'var(--radius-lg)', padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.5rem' }}>🏆</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>You're a Professional Mentor!</div>
            <div style={{ fontSize: '0.81rem', color: 'var(--text-secondary)' }}>Your teaching quality has earned you special recognition and incentives.</div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          HERO SECTION — AI Partner Recommendations (main feature)
      ════════════════════════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(179,157,219,0.08) 0%, rgba(244,143,177,0.06) 50%, rgba(128,203,196,0.07) 100%)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative background blobs */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(179,157,219,0.18), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,143,177,0.14), transparent 70%)', pointerEvents: 'none' }} />

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🤝</div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
                AI-Recommended Study Partners
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '3px 0 0', lineHeight: 1 }}>
                Matched by exam goals · skill barter · availability · prep level
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(179,157,219,0.18)', color: 'var(--accent-primary)', fontWeight: 700, border: '1px solid rgba(179,157,219,0.3)' }}>
              🤖 AI Powered
            </span>
            <button type="button" className="btn-primary" style={{ fontSize: '0.82rem', padding: '8px 18px' }} onClick={() => navigate('/matching')}>
              See All →
            </button>
          </div>
        </div>

        {/* Partner cards grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite', display: 'inline-block' }}>🧠</div>
            <div style={{ fontSize: '0.9rem' }}>AI is finding your best matches...</div>
          </div>
        ) : partners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>No partners found yet</div>
            <div style={{ fontSize: '0.85rem', marginBottom: 18 }}>Add subjects and skills to your profile to get AI-matched partners</div>
            <button type="button" className="btn-primary" onClick={() => navigate('/profile')}>Complete Your Profile →</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
            {partners.map((p, idx) => (
              <div
                key={p.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 16,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `fadeIn 0.3s ease ${idx * 0.06}s both`,
                }}
                onClick={() => navigate(`/profile/${p.id}`)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Top match indicator strip */}
                {idx === 0 && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }} />
                )}
                {idx === 0 && (
                  <div style={{ position: 'absolute', top: 8, right: 10, fontSize: '0.65rem', fontWeight: 700, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', color: 'white', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                    🔥 Best Match
                  </div>
                )}

                {/* Partner info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0, overflow: 'hidden' }}>
                    {p.avatar ? <img src={p.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.name?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.name}</span>
                      {p.mentor_tag && <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'var(--accent-yellow)', color: '#5a4000', fontWeight: 700 }}>🏆</span>}
                      {p.online && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} title="Online" />}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.college}{p.preparation_level ? ` · ${p.preparation_level}` : ''}
                    </div>
                  </div>
                  {/* Match score */}
                  <div style={{ textAlign: 'center', flexShrink: 0, background: matchBg(p.match_score), borderRadius: 'var(--radius-md)', padding: '5px 10px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: matchColor(p.match_score), lineHeight: 1 }}>{p.match_score}%</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 1 }}>match</div>
                  </div>
                </div>

                {/* Match reasons */}
                {p.match_reasons?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    {p.match_reasons.slice(0, 2).map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, fontSize: '0.73rem', color: 'var(--text-secondary)', marginBottom: 3 }}>
                        <span style={{ color: '#22c55e', fontWeight: 700, flexShrink: 0 }}>✓</span> {r}
                      </div>
                    ))}
                  </div>
                )}

                {/* Subject tags */}
                {p.subjects?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                    {p.subjects.slice(0, 3).map(s => (
                      <span key={s} style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.68rem', background: 'rgba(56,189,248,0.1)', color: '#1a3a5a', fontWeight: 500 }}>{s}</span>
                    ))}
                    {p.subjects.length > 3 && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>+{p.subjects.length - 3}</span>}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 7, marginTop: 4 }} onClick={e => e.stopPropagation()}>
                  <button type="button" className="btn-primary" style={{ flex: 1, padding: '7px', fontSize: '0.78rem' }} onClick={() => navigate('/matching')}>
                    🤝 Match
                  </button>
                  <button type="button" className="btn-secondary" style={{ flex: 1, padding: '7px', fontSize: '0.78rem' }} onClick={() => navigate(`/chat/${p.id}`)}>
                    💬 Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skill recommendations strip */}
        {skillRecs.length > 0 && (
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              💡 Skills you could learn from your matches
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skillRecs.map(r => (
                <button key={r.skill} type="button" onClick={() => navigate('/barter')}
                  style={{ padding: '5px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.77rem', fontWeight: 600, background: r.in_wanted ? 'rgba(179,157,219,0.2)' : 'var(--bg-hover)', color: r.in_wanted ? 'var(--primary)' : 'var(--text-secondary)', border: r.in_wanted ? '1.5px solid rgba(179,157,219,0.4)' : '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
                  {r.in_wanted ? '🎯' : '📚'} {r.skill} <span style={{ opacity: 0.6 }}>({r.frequency})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Secondary row: Stats + Quick Actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Top Skills on Platform */}
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16, color: 'var(--text-primary)' }}>📊 Top Skills on Platform</h2>
          {stats?.top_skills?.length
            ? stats.top_skills.slice(0, 6).map((s, i) => (
              <div key={s.skill} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 20, fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>#{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.skill}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>{s.count}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (s.count / (stats.top_skills[0]?.count || 1)) * 100)}%`, background: 'linear-gradient(90deg,var(--primary),var(--secondary))', borderRadius: 2, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              </div>
            ))
            : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No skill data yet</p>
          }
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16, color: 'var(--text-primary)' }}>⚡ Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '🔍', label: 'Find Partners', sub: 'AI match',      path: '/matching',  bg: 'rgba(244,143,177,0.15)'  },
              { icon: '🔄', label: 'Skill Barter',  sub: 'Exchange',      path: '/barter',    bg: 'rgba(179,157,219,0.15)'  },
              { icon: '💬', label: 'Messages',       sub: 'Chat',          path: '/chat',      bg: 'rgba(128,203,196,0.15)'  },
              { icon: '📅', label: 'Sessions',       sub: 'Schedule',      path: '/sessions',  bg: 'rgba(251,191,36,0.15)'   },
              { icon: '🏆', label: 'Mentors',        sub: 'Top teachers',  path: '/mentors',   bg: 'rgba(56,189,248,0.15)'   },
              { icon: '📊', label: 'Analytics',      sub: 'Your stats',    path: '/analytics', bg: 'rgba(244,143,177,0.12)'  },
            ].map(a => (
              <div key={a.path}
                onClick={() => navigate(a.path)}
                style={{ background: a.bg, cursor: 'pointer', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', transition: 'transform 0.18s, box-shadow 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{a.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.83rem', color: 'var(--text-primary)' }}>{a.label}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>{a.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
