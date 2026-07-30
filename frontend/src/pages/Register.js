import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import EduSelector from '../components/EduSelector';
import SubjectSearch from '../components/SubjectSearch';
import { DAYS, PREP_LEVELS } from '../utils/educationData';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5000/api';

const stepMeta = [
  { icon: '👤', title: 'Personal Details',       sub: 'Your basic info & password' },
  { icon: '📚', title: 'Education & Schedule',   sub: 'Academic study & availability' },
  { icon: '⭐', title: 'Skills I Can Teach',     sub: 'Knowledge you can share' },
  { icon: '🎓', title: 'Skills I Want to Learn', sub: 'What you want to gain' },
];

export default function Register() {
  const { completeRegistration } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    college: '', year: '', bio: '',
    academic_subjects: [],
    exam_goals: [],
    subjects: [],
    subjectDetails: [],
    preparation_level: 'Beginner',
    availability: [],
    skills_have: [],
    teachSubjectDetails: [],
    skills_want: [],
    learnSubjectDetails: [],
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    localStorage.removeItem('mm_token');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const validateStep1 = () => {
    if (!form.name.trim())                               { toast.error('Please enter your full name');     return false; }
    if (!form.email.trim() && !form.phone.trim())        { toast.error('Enter email or phone number');     return false; }
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) { toast.error('Enter a valid email address');     return false; }
    if (!form.password || form.password.length < 6)      { toast.error('Password must be 6+ characters'); return false; }
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const goPrev = () => {
    setStep(s => s - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const mergedSubjects = [...new Set([...form.academic_subjects, ...form.exam_goals])];
      const payload = { ...form, subjects: mergedSubjects, phone: form.phone ? `+91${form.phone}` : '' };
      const { data } = await axios.post(`${API_BASE}/auth/register`, payload);
      completeRegistration(data.user, data.token);
      toast.success('Account created! Welcome to MindMatch 🎉');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const Label = ({ children, required }) => (
    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.79rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}{required && <span style={{ color: 'var(--accent-pink)', marginLeft: 3 }}>*</span>}
    </label>
  );

  const iconInput = (icon, props) => (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '1rem' }}>{icon}</span>
      <input {...props} className="input-field" style={{ paddingLeft: 36, ...(props.style || {}) }} />
    </div>
  );

  const isWideStep = step >= 2;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', fontFamily: 'var(--font-body)' }}>

      {/* Sidebar */}
      <div className="reg-sidebar" style={{ width: 260, background: 'var(--auth-panel-bg)', display: 'flex', flexDirection: 'column', padding: '36px 24px', position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 5 }}>
        <Link to="/landing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 44 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🧠</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>MindMatch</span>
        </Link>

        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Registration Steps</p>

        {stepMeta.map((s, i) => {
          const n = i + 1;
          const done = n < step, active = n === step;
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 22 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: done ? 'rgba(255,255,255,0.92)' : active ? 'white' : 'rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: done ? '0.85rem' : '0.95rem', boxShadow: active ? '0 0 0 4px rgba(255,255,255,0.3)' : 'none', transition: 'all 0.3s', fontWeight: 700, color: done ? '#22c55e' : active ? '#e87aaa' : 'rgba(255,255,255,0.55)' }}>
                {done ? '✓' : s.icon}
              </div>
              <div style={{ paddingTop: 2 }}>
                <div style={{ fontWeight: active ? 700 : 500, fontSize: '0.86rem', color: active ? 'white' : done ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.5)', transition: 'all 0.3s' }}>{s.title}</div>
                <div style={{ fontSize: '0.71rem', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{s.sub}</div>
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.22)', borderRadius: 'var(--radius-md)', padding: 14 }}>
          <div style={{ fontSize: '0.78rem', color: 'white', fontWeight: 700, marginBottom: 4 }}>💎 100 Free Credits</div>
          <div style={{ fontSize: '0.71rem', color: 'rgba(255,255,255,0.78)' }}>Awarded on signup to kickstart your skill exchange!</div>
        </div>
      </div>

      {/* Main content */}
      <div className="reg-main" style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '36px 28px', minHeight: '100vh' }}>
        <button type="button" onClick={toggle} style={{ position: 'fixed', top: 18, right: 18, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '6px 13px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.8rem', zIndex: 20 }}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <div style={{ width: '100%', maxWidth: isWideStep ? 960 : 560, paddingTop: 8, transition: 'max-width 0.3s ease' }}>

          {/* Progress bar */}
          <div style={{ marginBottom: 26 }}>
            <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
              {[1, 2, 3, 4].map(s => (
                <div key={s} style={{ flex: 1, height: 5, borderRadius: 3, background: s <= step ? 'var(--primary)' : 'var(--border)', transition: 'background 0.35s' }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: 3 }}>{stepMeta[step - 1].title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>{stepMeta[step - 1].sub}</p>
              </div>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Step {step} of 4</span>
            </div>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); goNext(); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <Label required>Full Name</Label>
                {iconInput('✏️', { placeholder: 'e.g. Deekshitha Reddy', value: form.name, onChange: e => set('name', e.target.value), required: true })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <Label>Email</Label>
                  {iconInput('📧', { type: 'email', placeholder: 'your@email.com', value: form.email, onChange: e => set('email', e.target.value) })}
                </div>
                <div>
                  <Label>Phone (India)</Label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ padding: '10px', background: 'var(--bg-hover)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>🇮🇳 +91</span>
                    <input className="input-field" placeholder="10-digit" value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} style={{ flex: 1 }} />
                  </div>
                </div>
              </div>
              <div>
                <Label required>Password</Label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🔒</span>
                  <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} style={{ paddingLeft: 36, paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <Label>College / Institution</Label>
                  {iconInput('🏫', { placeholder: 'e.g. RGUKT RK Valley', value: form.college, onChange: e => set('college', e.target.value) })}
                </div>
                <div>
                  <Label>Year / Semester</Label>
                  {iconInput('📅', { placeholder: 'e.g. 3rd Year / Sem 5', value: form.year, onChange: e => set('year', e.target.value) })}
                </div>
              </div>
              <div>
                <Label>Short Bio</Label>
                <textarea className="input-field" placeholder="Describe your study goals and interests in 2-3 lines..." value={form.bio} onChange={e => set('bio', e.target.value)} rows={2} style={{ resize: 'vertical' }} />
              </div>
              <button className="btn-primary" type="submit" style={{ padding: '13px', fontSize: '0.95rem', marginTop: 4 }}>
                Continue to Education →
              </button>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                Already registered? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
              </p>
            </form>
          )}

          {/* STEP 2 — Education & Schedule: two separate columns */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div style={{ fontSize: '0.78rem', background: 'rgba(56,189,248,0.1)', color: '#0c4a6e', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(56,189,248,0.3)' }}>
                💡 <strong>Note:</strong> Many students prepare for exams different from their college syllabus — fill both sides independently!
              </div>

              {/* Two columns: academic LEFT, exam goals RIGHT */}
              <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
                <SectionBox icon="🏫" color="var(--accent-sky)" title="Currently Studying (Academic)" hint="Your current college / school subjects">
                  <EduSelector
                    selected={form.academic_subjects}
                    onChange={v => set('academic_subjects', v)}
                    accentColor="var(--accent-sky)"
                  />
                </SectionBox>

                <SectionBox icon="🎯" color="var(--accent-pink)" title="Preparing For (Exams / Goals)" hint="Competitive exams, certifications, career goals">
                  <EduSelector
                    selected={form.exam_goals}
                    onChange={v => set('exam_goals', v)}
                    accentColor="var(--accent-pink)"
                  />
                </SectionBox>
              </div>

              {/* Prep level */}
              <SectionBox icon="📈" color="var(--accent-lavender)" title="Preparation Level" hint="How advanced are you overall?">
                <div style={{ display: 'flex', gap: 10 }}>
                  {PREP_LEVELS.map(l => (
                    <button key={l} type="button" onClick={() => set('preparation_level', l)}
                      style={{ flex: 1, padding: '10px 6px', borderRadius: 'var(--radius-md)', border: form.preparation_level === l ? '2px solid var(--primary)' : '1.5px solid var(--border)', background: form.preparation_level === l ? 'var(--accent-pink)' : 'var(--bg-input)', color: form.preparation_level === l ? 'var(--primary-dark)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: form.preparation_level === l ? 700 : 400, transition: 'var(--transition)', fontFamily: 'var(--font-body)' }}>
                      {l === 'Beginner' ? '🌱 Beginner' : l === 'Intermediate' ? '📈 Intermediate' : '🚀 Advanced'}
                    </button>
                  ))}
                </div>
              </SectionBox>

              {/* Available days */}
              <SectionBox icon="📅" color="var(--accent-mint)" title="Available Days to Study" hint="When are you free? Select all that apply">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DAYS.map(d => (
                    <button key={d} type="button"
                      onClick={() => set('availability', form.availability.includes(d) ? form.availability.filter(x => x !== d) : [...form.availability, d])}
                      style={{ padding: '7px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.84rem', border: form.availability.includes(d) ? '2px solid var(--primary)' : '1.5px solid var(--border)', background: form.availability.includes(d) ? 'var(--accent-mint)' : 'var(--bg-input)', color: form.availability.includes(d) ? '#1a5a3a' : 'var(--text-muted)', cursor: 'pointer', fontWeight: form.availability.includes(d) ? 700 : 400, transition: 'var(--transition)', fontFamily: 'var(--font-body)' }}>
                      {d}
                    </button>
                  ))}
                </div>
              </SectionBox>

              <StepNav onBack={goPrev} onNext={goNext} nextLabel="Continue to Teaching Skills →" />
            </div>
          )}

          {/* STEP 3 — Skills I Can Teach */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ fontSize: '0.78rem', background: 'rgba(34,197,94,0.1)', color: '#166534', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34,197,94,0.25)' }}>
                💡 <strong>Tip:</strong> Every session you teach earns <strong>Skill Credits</strong> you can spend to learn from others!
              </div>
              <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

                {/* LEFT */}
                <SectionBox icon="⭐" color="var(--accent-mint)" title="What can YOU teach?" hint="Pick subjects, skills or exams you can help others with">
                  <EduSelector
                    selected={form.skills_have}
                    onChange={v => set('skills_have', v)}
                    accentColor="var(--accent-mint)"
                  />
                </SectionBox>

                {/* RIGHT — raw div, NOT SectionBox, so no overflow:hidden */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18, position: 'relative', minHeight: 220 }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 70, height: 70, background: 'radial-gradient(circle,var(--accent-sky)55,transparent 70%)', pointerEvents: 'none', borderRadius: 'var(--radius-lg)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', flexShrink: 0 }}>📖</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>Specific topics you can teach</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Type a topic name and press Enter. Shown in search results.</div>
                    </div>
                  </div>
                  {form.skills_have.length === 0 ? (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>
                      ← Select a subject on the left first
                    </div>
                  ) : (
                    <SubjectSearch
                      placeholder="e.g. Dynamic Programming, Organic Reactions, Essay Writing..."
                      selectedItems={form.teachSubjectDetails}
                      onChangeItems={v => set('teachSubjectDetails', v)}
                      context={form.skills_have}
                      tagColor="var(--accent-mint)"
                    />
                  )}
                </div>
              </div>
              <StepNav onBack={goPrev} onNext={goNext} nextLabel="Continue to Learning Goals →" />
            </div>
          )}

          {/* STEP 4 — Skills I Want to Learn */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ fontSize: '0.78rem', background: 'rgba(155,124,212,0.1)', color: '#4a1a6a', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(155,124,212,0.25)' }}>
                💎 You receive <strong>100 free credits</strong> on signup — spend them to learn from expert partners!
              </div>
              <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

                {/* LEFT */}
                <SectionBox icon="🎓" color="var(--accent-lavender)" title="What do YOU want to learn?" hint="Select exams, skills or topics you want to master">
                  <EduSelector
                    selected={form.skills_want}
                    onChange={v => set('skills_want', v)}
                    accentColor="var(--accent-lavender)"
                  />
                </SectionBox>

                {/* RIGHT — raw div, NOT SectionBox */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18, position: 'relative', minHeight: 220 }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 70, height: 70, background: 'radial-gradient(circle,var(--accent-lavender)55,transparent 70%)', pointerEvents: 'none', borderRadius: 'var(--radius-lg)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', flexShrink: 0 }}>🔍</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>Specific topics you want to learn</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>The more specific, the better your AI matches will be!</div>
                    </div>
                  </div>
                  {form.skills_want.length === 0 ? (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>
                      ← Select a subject on the left first
                    </div>
                  ) : (
                    <SubjectSearch
                      placeholder="e.g. Integration by Parts, Recursion, Indian Polity, Profit & Loss..."
                      selectedItems={form.learnSubjectDetails}
                      onChangeItems={v => set('learnSubjectDetails', v)}
                      context={form.skills_want}
                      tagColor="var(--accent-lavender)"
                    />
                  )}
                </div>
              </div>

              {/* Account summary */}
              <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 10 }}>✅ Account Summary — Ready to Create</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div>👤 <strong>{form.name}</strong>{form.college && ` · ${form.college}`}{form.year && ` · ${form.year}`}</div>
                  {form.email && <div>📧 {form.email}</div>}
                  {form.phone && <div>📱 +91 {form.phone}</div>}
                  <div>🏫 Studying: <strong>{form.academic_subjects.length}</strong> subjects · 🎯 Preparing for: <strong>{form.exam_goals.length}</strong> goals</div>
                  <div>📅 Available: <strong>{form.availability.length}</strong> days · Level: <strong>{form.preparation_level}</strong></div>
                  <div>⭐ Can teach <strong>{form.skills_have.length}</strong> skills ({form.teachSubjectDetails.length} specific topics)</div>
                  <div>🎓 Wants to learn <strong>{form.skills_want.length}</strong> skills ({form.learnSubjectDetails.length} specific topics)</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-secondary" onClick={goPrev} style={{ flex: 1, padding: 12 }}>← Back</button>
                <button type="button" className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: 13, fontSize: '0.97rem' }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Creating your account...
                    </span>
                  ) : '🚀 Create My Account'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @media (max-width:680px){ .reg-sidebar{display:none!important} .reg-main{margin-left:0!important} }
        @media (max-width:760px){ .skills-grid{grid-template-columns:1fr!important} }
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

/* ── SectionBox: overflow VISIBLE so dropdowns inside are never clipped ── */
function SectionBox({ icon, color, title, hint, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18, position: 'relative', overflow: 'visible' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 70, height: 70, background: `radial-gradient(circle,${color}55,transparent 70%)`, pointerEvents: 'none', borderRadius: 'var(--radius-lg)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: hint ? 4 : 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{title}</div>
          {hint && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{hint}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function StepNav({ onBack, onNext, nextLabel }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
      <button type="button" className="btn-secondary" onClick={onBack} style={{ flex: 1, padding: 12 }}>← Back</button>
      <button type="button" className="btn-primary" onClick={onNext} style={{ flex: 2, padding: 12, fontSize: '0.92rem' }}>{nextLabel}</button>
    </div>
  );
}
