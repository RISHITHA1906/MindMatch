import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import EduSelector from '../components/EduSelector';
import SubjectSearch from '../components/SubjectSearch';
import { DAYS, PREP_LEVELS } from '../utils/educationData';
import toast from 'react-hot-toast';

// ── Tag chip ──────────────────────────────────────────────────
function Tag({ label, bg, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 11px', borderRadius: 'var(--radius-full)',
      fontSize: '0.75rem', fontWeight: 600,
      background: bg || 'var(--accent-pink)',
      color: color || 'var(--primary-dark)',
      margin: '3px 3px 3px 0',
      border: '1px solid rgba(0,0,0,0.05)',
    }}>{label}</span>
  );
}

// ── Section heading ────────────────────────────────────────────
function SectionHead({ icon, title, count, extra }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 12, paddingBottom: 10,
      borderBottom: '1.5px solid var(--border)',
    }}>
      <span style={{ fontSize: '1.05rem' }}>{icon}</span>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: '0.97rem', color: 'var(--text-primary)',
      }}>{title}</span>
      {count !== undefined && (
        <span style={{
          fontSize: '0.68rem', fontWeight: 700,
          background: 'var(--bg-hover)', color: 'var(--text-muted)',
          padding: '2px 8px', borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border)',
        }}>{count} item{count !== 1 ? 's' : ''}</span>
      )}
      {extra && <span style={{ marginLeft: 'auto' }}>{extra}</span>}
    </div>
  );
}

// ── Edit section card ──────────────────────────────────────────
function EditCard({ icon, title, hint, accent, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 18, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 70, height: 70,
        background: `radial-gradient(circle, ${accent}33, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.88rem', flexShrink: 0,
        }}>{icon}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{title}</div>
          {hint && <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)' }}>{hint}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Profile() {
  const { userId } = useParams();
  const { user, updateUser, API } = useAuth();
  const navigate = useNavigate();
  const isMe = !userId || userId === user?.id;

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({});
  const [loading, setLoading] = useState(true);
  const [rating,  setRating]  = useState(5);
  const [review,  setReview]  = useState('');
  const fileRef = useRef();

  useEffect(() => {
    const url = isMe ? `${API}/auth/me` : `${API}/users/${userId}`;
    axios.get(url)
      .then(r => { setProfile(r.data); if (isMe) setForm(r.data); })
      .catch(() => toast.error('User not found'))
      .finally(() => setLoading(false));
  }, [userId, API, isMe]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    try {
      const { data } = await axios.put(`${API}/users/profile`, form);
      setProfile(data); updateUser(data);
      setEditing(false);
      toast.success('Profile updated! ✅');
    } catch { toast.error('Update failed'); }
  };

  const submitRating = async () => {
    try {
      await axios.post(`${API}/users/rate/${userId}`, { rating, review });
      toast.success('Rating submitted!'); setReview('');
    } catch { toast.error('Rating failed'); }
  };

  const handleAvatarUpload = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div style={{ padding: 60, color: 'var(--text-muted)', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: 10 }}>⏳</div>Loading profile...
    </div>
  );
  if (!profile) return (
    <div style={{ padding: 60, color: 'var(--text-muted)', textAlign: 'center' }}>Profile not found</div>
  );

  const p = editing ? form : profile;
  const editBtn = isMe && !editing
    ? <button type="button" onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'var(--font-body)', padding: '2px 6px' }}>Add →</button>
    : null;

  return (
    <div style={{ padding: '24px 28px', maxWidth: 940 }}>

      {/* ── Header card ── */}
      <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{ height: 82, background: 'linear-gradient(135deg,var(--accent-pink),var(--accent-lavender),var(--accent-sky))' }} />
        <div style={{ padding: '0 24px 22px' }}>

          {/* Avatar + name row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -42, marginBottom: 16 }}>
            <div
              style={{ position: 'relative', cursor: isMe && editing ? 'pointer' : 'default', flexShrink: 0 }}
              onClick={() => isMe && editing && fileRef.current?.click()}
            >
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--primary),var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '1.9rem',
                border: '4px solid var(--bg-card)', overflow: 'hidden',
              }}>
                {p.avatar
                  ? <img src={p.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : p.name?.[0]}
              </div>
              {isMe && editing && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.1rem' }}>✏️</div>
              )}
              <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />
            </div>

            <div style={{ flex: 1, paddingBottom: 4, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                {editing
                  ? <input className="input-field" value={form.name || ''} onChange={e => set('name', e.target.value)} style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-display)', padding: '4px 10px', maxWidth: 260 }} />
                  : <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>{p.name}</h1>
                }
                {p.mentor_tag && <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'var(--accent-yellow)', color: '#5a4000', fontWeight: 700 }}>🏆 Professional Mentor</span>}
                {p.online && !isMe && <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} title="Online" />}
              </div>
              {editing ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input className="input-field" value={form.college || ''} onChange={e => set('college', e.target.value)} placeholder="College / Institution" style={{ fontSize: '0.82rem', padding: '4px 10px', maxWidth: 210 }} />
                  <input className="input-field" value={form.year || ''} onChange={e => set('year', e.target.value)} placeholder="Year / Semester" style={{ fontSize: '0.82rem', padding: '4px 10px', maxWidth: 140 }} />
                </div>
              ) : (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {[p.college, p.year].filter(Boolean).join(' · ')}{p.phone && ` · 📱 ${p.phone}`}
                </div>
              )}
              {p.reputation_score > 0 && <div style={{ fontSize: '0.77rem', color: '#f59e0b', marginTop: 3 }}>⭐ {p.reputation_score}/5 · 📅 {p.total_sessions || 0} sessions</div>}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            {[
              ['💎','Credits',    p.skill_credits || 0,          'rgba(251,191,36,0.18)'],
              ['⭐','Rating',     `${p.reputation_score || 0}/5`, 'rgba(179,157,219,0.18)'],
              ['📅','Sessions',   p.total_sessions || 0,          'rgba(128,203,196,0.18)'],
              ['🎯','Level',      p.preparation_level || '–',     'rgba(56,189,248,0.18)'],
            ].map(([ico, lbl, val, bg]) => (
              <div key={lbl} style={{ textAlign: 'center', background: bg, borderRadius: 'var(--radius-md)', padding: '10px 6px' }}>
                <div style={{ fontSize: '1.1rem', marginBottom: 2 }}>{ico}</div>
                <div style={{ fontWeight: 700, fontSize: '0.97rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{val}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>

          {/* Bio */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>About</div>
            {editing
              ? <textarea className="input-field" value={form.bio || ''} onChange={e => set('bio', e.target.value)} rows={2} style={{ resize: 'vertical' }} placeholder="Tell others about your goals..." />
              : <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{p.bio || 'No bio added yet.'}</p>
            }
          </div>

          {/* Buttons */}
          {isMe ? (
            <div style={{ display: 'flex', gap: 10 }}>
              {editing
                ? <><button type="button" className="btn-primary" onClick={save}>💾 Save Changes</button><button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button></>
                : <button type="button" className="btn-primary" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
              }
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn-primary" onClick={() => navigate(`/chat/${p.id}`)}>💬 Message</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/sessions')}>📅 Schedule Session</button>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════
          EDIT MODE
      ════════════════════════════════ */}
      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <EditCard icon="⭐" title="Skills I Can Teach" hint="Browse & select exams, subjects, skills" accent="var(--accent-mint)">
              <EduSelector selected={form.skills_have || []} onChange={v => set('skills_have', v)} accentColor="var(--accent-mint)" />
            </EditCard>
            <EditCard icon="🎓" title="Skills I Want to Learn" hint="Browse & select exams, subjects, skills" accent="var(--accent-lavender)">
              <EduSelector selected={form.skills_want || []} onChange={v => set('skills_want', v)} accentColor="var(--accent-lavender)" />
            </EditCard>
          </div>

          <EditCard icon="📚" title="Subjects & Exams I'm Preparing For" hint="What are you currently studying or targeting?" accent="var(--accent-sky)">
            <EduSelector selected={form.subjects || []} onChange={v => set('subjects', v)} accentColor="var(--accent-sky)" />
          </EditCard>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <EditCard icon="📖" title="Specific Topics I Can Teach" hint="Chapter/topic level — type & press Enter" accent="var(--accent-mint)">
              <SubjectSearch
                placeholder="e.g. Dynamic Programming, Thermodynamics..."
                selectedItems={form.teachSubjectDetails || []}
                onChangeItems={v => set('teachSubjectDetails', v)}
                context={form.skills_have || []}
                tagColor="var(--accent-mint)"
              />
            </EditCard>
            <EditCard icon="🔍" title="Specific Topics I Want to Learn" hint="Chapter/topic level — type & press Enter" accent="var(--accent-lavender)">
              <SubjectSearch
                placeholder="e.g. Integration, Indian Polity, Profit & Loss..."
                selectedItems={form.learnSubjectDetails || []}
                onChangeItems={v => set('learnSubjectDetails', v)}
                context={form.skills_want || []}
                tagColor="var(--accent-lavender)"
              />
            </EditCard>
          </div>

          <EditCard icon="🎯" title="Preparation Level" hint="Your overall readiness level" accent="var(--accent-sky)">
            <div style={{ display: 'flex', gap: 10 }}>
              {PREP_LEVELS.map(l => (
                <button key={l} type="button" onClick={() => set('preparation_level', l)}
                  style={{ flex: 1, padding: '10px 6px', borderRadius: 'var(--radius-md)', border: form.preparation_level === l ? '2px solid var(--primary)' : '1.5px solid var(--border)', background: form.preparation_level === l ? 'var(--accent-sky)' : 'var(--bg-input)', color: form.preparation_level === l ? 'var(--primary-dark)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: form.preparation_level === l ? 700 : 400, fontFamily: 'var(--font-body)', transition: 'var(--transition)' }}>
                  {l === 'Beginner' ? '🌱 Beginner' : l === 'Intermediate' ? '📈 Intermediate' : '🚀 Advanced'}
                </button>
              ))}
            </div>
          </EditCard>

          <EditCard icon="📅" title="Available Days" hint="Which days can you study?" accent="var(--accent-mint)">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {DAYS.map(d => (
                <button key={d} type="button"
                  onClick={() => set('availability', form.availability?.includes(d) ? form.availability.filter(x => x !== d) : [...(form.availability || []), d])}
                  style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.81rem', border: form.availability?.includes(d) ? '2px solid var(--primary)' : '1px solid var(--border)', background: form.availability?.includes(d) ? 'var(--accent-mint)' : 'var(--bg-input)', color: form.availability?.includes(d) ? '#1a5a3a' : 'var(--text-muted)', cursor: 'pointer', fontWeight: form.availability?.includes(d) ? 600 : 400, fontFamily: 'var(--font-body)' }}>
                  {d}
                </button>
              ))}
            </div>
          </EditCard>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-primary" onClick={save} style={{ padding: '12px 28px', fontSize: '0.95rem' }}>💾 Save Changes</button>
            <button type="button" className="btn-secondary" onClick={() => setEditing(false)} style={{ padding: '12px 20px' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          VIEW MODE — Clear sections with headings
      ════════════════════════════════ */}
      {!editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>

          {/* Can Teach + Wants to Learn */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="card">
              <SectionHead icon="⭐" title="Skills I Can Teach" count={p.skills_have?.length || 0} extra={editBtn} />
              {p.skills_have?.length
                ? <div>{p.skills_have.map(s => <Tag key={s} label={s} bg="rgba(34,197,94,0.12)" color="#166534" />)}</div>
                : <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic', margin: 0 }}>No teaching skills listed yet.</p>
              }
            </div>
            <div className="card">
              <SectionHead icon="🎓" title="Skills I Want to Learn" count={p.skills_want?.length || 0} extra={editBtn} />
              {p.skills_want?.length
                ? <div>{p.skills_want.map(s => <Tag key={s} label={s} bg="rgba(155,124,212,0.12)" color="#4a1a6a" />)}</div>
                : <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic', margin: 0 }}>No learning goals listed yet.</p>
              }
            </div>
          </div>

          {/* Subjects & Exams */}
          <div className="card">
            <SectionHead icon="📚" title="Subjects & Exams Preparing For" count={p.subjects?.length || 0} extra={editBtn} />
            {p.subjects?.length
              ? <div>{p.subjects.map(s => <Tag key={s} label={s} bg="rgba(56,189,248,0.12)" color="#1a3a5a" />)}</div>
              : <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic', margin: 0 }}>No subjects listed yet.</p>
            }
          </div>

          {/* Specific topics (teach & learn) */}
          {(p.teachSubjectDetails?.length > 0 || p.learnSubjectDetails?.length > 0 || p.subjectDetails?.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 14 }}>
              {p.teachSubjectDetails?.length > 0 && (
                <div className="card">
                  <SectionHead icon="📖" title="Specific Topics I Teach" count={p.teachSubjectDetails.length} />
                  <div>{p.teachSubjectDetails.map(s => <Tag key={s} label={s} bg="rgba(34,197,94,0.10)" color="#166534" />)}</div>
                </div>
              )}
              {p.learnSubjectDetails?.length > 0 && (
                <div className="card">
                  <SectionHead icon="🔍" title="Specific Topics I'm Learning" count={p.learnSubjectDetails.length} />
                  <div>{p.learnSubjectDetails.map(s => <Tag key={s} label={s} bg="rgba(155,124,212,0.10)" color="#4a1a6a" />)}</div>
                </div>
              )}
              {p.subjectDetails?.length > 0 && (
                <div className="card">
                  <SectionHead icon="🗂️" title="Subject Details" count={p.subjectDetails.length} />
                  <div>{p.subjectDetails.map(s => <Tag key={s} label={s} bg="rgba(56,189,248,0.10)" color="#1a3a5a" />)}</div>
                </div>
              )}
            </div>
          )}

          {/* Availability */}
          <div className="card">
            <SectionHead icon="📅" title="Available Days to Study" count={p.availability?.length || 0} extra={editBtn} />
            {p.availability?.length
              ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {p.availability.map(d => (
                    <span key={d} style={{ padding: '5px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(251,191,36,0.14)', color: '#92400e', border: '1px solid rgba(251,191,36,0.3)' }}>{d}</span>
                  ))}
                </div>
              )
              : <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic', margin: 0 }}>Availability not set.</p>
            }
          </div>
        </div>
      )}

      {/* ── Rate learner (others only) ── */}
      {!isMe && (
        <div className="card">
          <SectionHead icon="⭐" title="Rate this Learner" />
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {[1,2,3,4,5].map(s => (
              <button key={s} type="button" onClick={() => setRating(s)}
                style={{ fontSize: '1.55rem', background: 'none', border: 'none', cursor: 'pointer', opacity: s <= rating ? 1 : 0.3, transform: s <= rating ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.15s' }}>⭐</button>
            ))}
          </div>
          <textarea className="input-field" placeholder="Write a review about learning with this person..." value={review} onChange={e => setReview(e.target.value)} rows={3} style={{ marginBottom: 12 }} />
          <button type="button" className="btn-primary" onClick={submitRating}>Submit Rating</button>
        </div>
      )}
    </div>
  );
}
