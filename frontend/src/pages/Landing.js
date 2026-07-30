import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const features = [
  { icon: '🧠', title: 'AI-Powered Matching', desc: 'Smart algorithm finds compatible study partners based on your subjects, goals, availability and prep level.' },
  { icon: '🔄', title: 'Skill Barter System', desc: 'Teach what you know, learn what you need — no money involved. Trade skills using our credit system.' },
  { icon: '🎥', title: 'Video & Audio Calls', desc: 'Built-in real-time video/audio calls. Study together like a virtual classroom from anywhere in India.' },
  { icon: '💬', title: 'Real-time Chat', desc: 'Instant messaging with file, image sharing and typing indicators to stay connected with partners.' },
  { icon: '🏆', title: 'Mentor Recognition', desc: 'Top-rated contributors earn the Professional Mentor badge plus scholarships and internship opportunities.' },
  { icon: '📊', title: 'Learning Analytics', desc: 'Track your sessions, credits, reputation and see trending skills across the platform.' },
];

const exams = ['JEE Main', 'JEE Advanced', 'NEET', 'UPSC CSE', 'GATE', 'SSC CGL', 'CAT', 'CLAT', 'NDA', 'Banking PO', 'State PSC', 'IBPS'];

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64,
        background: 'var(--bg-overlay)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🧠</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>MindMatch</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={toggle} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '6px 14px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '7px 18px', fontSize: '0.88rem' }}>Sign In</button>
          <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>Get Started →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 110, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', top: '-5%', left: '-8%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(248,200,220,0.35),transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(212,184,240,0.3),transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(184,232,212,0.2),transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', gap: 60 }}>
          {/* Text side */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-pink)', borderRadius: 'var(--radius-full)', padding: '5px 14px', marginBottom: 22, border: '1px solid rgba(232,122,170,0.25)' }}>
              <span style={{ fontSize: '0.75rem' }}>✨</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary-dark)' }}>AI-Powered Peer Learning · Built for India</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.4rem)', lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: 18 }}>
              Find Your Perfect<br />
              <span style={{ background: 'linear-gradient(135deg,var(--primary),var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Study Partner</span> Today
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 500, lineHeight: 1.75, marginBottom: 32 }}>
              MindMatch uses AI to connect students preparing for JEE, NEET, UPSC, GATE and 50+ other exams. Exchange skills without spending money. <strong>Learn together, grow together.</strong>
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: 'var(--radius-full)', boxShadow: '0 4px 24px rgba(232,122,170,0.35)' }}>
                🚀 Get Started Free
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '14px 24px', fontSize: '1rem' }}>
                Sign In →
              </button>
            </div>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[['👥', '500+', 'Students'], ['📚', '50+', 'Exam categories'], ['💎', '100', 'Free credits']].map(([ico, val, lbl]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.2rem' }}>{ico}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{val}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lbl}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Illustration side */}
          <div style={{ flex: '0 0 440px', position: 'relative' }}>
            {/* Main illustration card */}
            <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              {/* SVG study illustration with opacity overlay */}
              <svg viewBox="0 0 440 360" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
                {/* Background gradient */}
                <defs>
                  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f8c8dc" />
                    <stop offset="50%" stopColor="#d4b8f0" />
                    <stop offset="100%" stopColor="#b8d8f0" />
                  </linearGradient>
                  <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b8d8f0" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#d4b8f0" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                <rect width="440" height="360" fill="url(#bg)" />

                {/* Grid lines - subtle */}
                {[60,120,180,240,300].map(y => <line key={y} x1="0" y1={y} x2="440" y2={y} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />)}
                {[88,176,264,352].map(x => <line key={x} x1={x} y1="0" x2={x} y2="360" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />)}

                {/* Desk */}
                <rect x="40" y="290" width="360" height="14" rx="7" fill="rgba(255,255,255,0.55)" />

                {/* Laptop screen */}
                <rect x="140" y="160" width="160" height="120" rx="12" fill="rgba(255,255,255,0.75)" />
                <rect x="150" y="170" width="140" height="95" rx="6" fill="url(#screen)" />
                {/* Screen content lines */}
                <rect x="162" y="183" width="80" height="6" rx="3" fill="rgba(255,255,255,0.7)" />
                <rect x="162" y="195" width="55" height="4" rx="2" fill="rgba(255,255,255,0.5)" />
                <rect x="162" y="210" width="116" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
                <rect x="162" y="220" width="90" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
                <rect x="162" y="235" width="70" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
                {/* Laptop base */}
                <rect x="120" y="280" width="200" height="10" rx="5" fill="rgba(255,255,255,0.6)" />
                <rect x="195" y="289" width="50" height="5" rx="3" fill="rgba(255,255,255,0.5)" />

                {/* Person 1 - left */}
                <circle cx="90" cy="195" r="32" fill="rgba(255,255,255,0.5)" />
                <circle cx="90" cy="180" r="16" fill="rgba(248,200,220,0.9)" />
                <path d="M58 240 Q58 215 90 215 Q122 215 122 240" fill="rgba(248,200,220,0.7)" />
                {/* Person 1 book */}
                <rect x="52" y="240" width="50" height="36" rx="5" fill="rgba(255,255,255,0.7)" />
                <rect x="58" y="248" width="38" height="4" rx="2" fill="rgba(212,184,240,0.7)" />
                <rect x="58" y="256" width="28" height="3" rx="1.5" fill="rgba(212,184,240,0.5)" />
                <rect x="58" y="263" width="34" height="3" rx="1.5" fill="rgba(212,184,240,0.5)" />

                {/* Person 2 - right */}
                <circle cx="350" cy="195" r="32" fill="rgba(255,255,255,0.5)" />
                <circle cx="350" cy="180" r="16" fill="rgba(184,232,212,0.9)" />
                <path d="M318 240 Q318 215 350 215 Q382 215 382 240" fill="rgba(184,232,212,0.7)" />
                {/* Person 2 notebook */}
                <rect x="338" y="240" width="50" height="36" rx="5" fill="rgba(255,255,255,0.7)" />
                <rect x="344" y="248" width="38" height="4" rx="2" fill="rgba(184,232,212,0.7)" />
                <rect x="344" y="256" width="24" height="3" rx="1.5" fill="rgba(184,232,212,0.5)" />
                <rect x="344" y="263" width="30" height="3" rx="1.5" fill="rgba(184,232,212,0.5)" />

                {/* Connection line between people */}
                <path d="M122 230 Q220 170 318 230" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeDasharray="6,4" />
                <circle cx="220" cy="188" r="5" fill="rgba(255,255,255,0.7)" />

                {/* Match score bubble */}
                <rect x="174" y="100" width="92" height="32" rx="16" fill="rgba(255,255,255,0.85)" />
                <text x="220" y="121" textAnchor="middle" fontSize="12" fontWeight="700" fill="#e87aaa">✦ 94% Match</text>

                {/* Floating tags */}
                <rect x="22" y="80" width="72" height="22" rx="11" fill="rgba(255,255,255,0.7)" />
                <text x="58" y="95" textAnchor="middle" fontSize="10" fill="#5a4a6a">📚 JEE 2025</text>

                <rect x="346" y="80" width="72" height="22" rx="11" fill="rgba(255,255,255,0.7)" />
                <text x="382" y="95" textAnchor="middle" fontSize="10" fill="#1a5a3a">⭐ Python</text>

                <rect x="22" y="120" width="68" height="22" rx="11" fill="rgba(255,255,255,0.6)" />
                <text x="56" y="135" textAnchor="middle" fontSize="10" fill="#5a4a6a">🎯 UPSC</text>

                <rect x="350" y="120" width="68" height="22" rx="11" fill="rgba(255,255,255,0.6)" />
                <text x="384" y="135" textAnchor="middle" fontSize="10" fill="#1a3a5a">💬 Chat</text>

                {/* Sparkles */}
                <text x="310" y="60" fontSize="18" fill="rgba(255,255,255,0.7)">✦</text>
                <text x="100" y="65" fontSize="13" fill="rgba(255,255,255,0.6)">✦</text>
                <text x="200" y="48" fontSize="10" fill="rgba(255,255,255,0.5)">✦</text>
                <text x="410" y="150" fontSize="14" fill="rgba(255,255,255,0.5)">✦</text>
                <text x="15" y="200" fontSize="11" fill="rgba(255,255,255,0.5)">✦</text>
              </svg>
            </div>

            {/* Floating card 1 */}
            <div className="card" style={{ position: 'absolute', bottom: -18, left: -24, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-lg)', minWidth: 180 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎉</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>Match Found!</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Priya matched with Rahul</div>
              </div>
            </div>

            {/* Floating card 2 */}
            <div className="card" style={{ position: 'absolute', top: -18, right: -20, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: 'var(--shadow-lg)' }}>
              <span style={{ fontSize: '1rem' }}>💎</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)' }}>+10 Credits Earned</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Taught Python to Ananya</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXAM TARGETS STRIP ── */}
      <section style={{ padding: '48px 40px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 20 }}>Trusted by students preparing for</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {exams.map(e => (
              <span key={e} style={{ padding: '7px 16px', borderRadius: 'var(--radius-full)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.84rem', border: '1px solid var(--border)', transition: 'var(--transition)' }}>{e}</span>
            ))}
            <span style={{ padding: '7px 16px', borderRadius: 'var(--radius-full)', background: 'var(--accent-pink)', color: 'var(--primary-dark)', fontWeight: 600, fontSize: '0.84rem', border: '1px solid rgba(232,122,170,0.3)' }}>+ 40 more ✦</span>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 10 }}>Everything You Need to Learn Better</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>Powerful tools designed for collaborative studying between Indian students</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <div key={f.title} className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle, ${['rgba(248,200,220,0.3)','rgba(212,184,240,0.3)','rgba(184,232,212,0.3)','rgba(184,216,240,0.3)','rgba(248,240,184,0.3)','rgba(255,212,184,0.3)'][i % 6]}, transparent 70%)`, borderRadius: '0 0 0 80px', pointerEvents: 'none' }} />
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: 8, color: 'var(--text-primary)' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '72px 40px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 48 }}>How MindMatch Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 32 }}>
            {[
              { n: '1', ico: '📝', title: 'Create Your Profile', desc: 'Enter your subjects, exam targets, skills and availability.' },
              { n: '2', ico: '🧠', title: 'Get AI Matched', desc: 'Our algorithm instantly finds your most compatible study partners.' },
              { n: '3', ico: '🤝', title: 'Send a Match Request', desc: 'Connect with partners — both sides confirm before study begins.' },
              { n: '4', ico: '🚀', title: 'Learn Together', desc: 'Chat, video call, share files and exchange skills freely.' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem', marginBottom: 16, boxShadow: '0 4px 16px rgba(232,122,170,0.3)' }}>{s.ico}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Step {s.n}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 8, color: 'var(--text-primary)' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: 200 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(248,200,220,0.15),rgba(212,184,240,0.15))', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🧠</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: 12, color: 'var(--text-primary)' }}>Ready to Find Your Study Partner?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '1rem', lineHeight: 1.7 }}>Join students across India learning together on MindMatch. Free forever, no credit card needed.</p>
          <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '15px 40px', fontSize: '1.05rem', borderRadius: 'var(--radius-full)', boxShadow: '0 6px 28px rgba(232,122,170,0.35)' }}>
            🚀 Get Started for Free
          </button>
          <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start with 💎 100 free skill credits</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '24px 40px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🧠</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>MindMatch</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>© 2024 MindMatch · AI Peer Learning for India's Students</p>
        <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>Made with ❤️ for Indian students</span>
        </div>
      </footer>
    </div>
  );
}
