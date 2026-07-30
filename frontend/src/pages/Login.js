import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5000/api';

export default function Login() {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  // Modes: 'login' | 'forgot' | 'reset'
  const [mode,     setMode]     = useState('login');
  const [form,     setForm]     = useState({ identifier: '', password: '' });
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Forgot password state
  const [fpStep,    setFpStep]    = useState(1);  // 1 = enter email, 2 = enter OTP+new pass
  const [fpEmail,   setFpEmail]   = useState('');
  const [fpOtp,     setFpOtp]     = useState('');
  const [fpNewPass, setFpNewPass] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Login submit ───────────────────────────────────────────
  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.identifier, form.password);
      toast.success('Welcome back! 👋');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  // ── Forgot: step 1 — send OTP ─────────────────────────────
  const handleForgotSend = async () => {
    if (!fpEmail.trim()) return toast.error('Enter your email or phone');
    setFpLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/forgot-password`, { identifier: fpEmail });
      toast.success('OTP sent! Check your email / phone (or server console in dev mode)');
      if (res.data.dev_otp) toast(`Dev OTP: ${res.data.dev_otp}`, { icon: '🔑', duration: 20000 });
      setFpStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not send OTP');
    } finally { setFpLoading(false); }
  };

  // ── Forgot: step 2 — verify OTP + reset password ──────────
  const handleForgotReset = async () => {
    if (!fpOtp || fpOtp.length < 6) return toast.error('Enter the 6-digit OTP');
    if (!fpNewPass || fpNewPass.length < 6) return toast.error('New password must be 6+ characters');
    setFpLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/reset-password`, {
        identifier: fpEmail,
        otp: fpOtp,
        new_password: fpNewPass,
      });
      toast.success('Password reset! Please log in with your new password 🎉');
      setMode('login'); setFpStep(1); setFpEmail(''); setFpOtp(''); setFpNewPass('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed — check OTP');
    } finally { setFpLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', fontFamily: 'var(--font-body)' }}>

      {/* Left illustration panel */}
      <div className="login-left-panel" style={{ flex: 1, display: 'none', background: 'var(--auth-panel-bg)', position: 'relative', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <svg viewBox="0 0 400 350" style={{ width: '100%', maxWidth: 380, opacity: 0.9 }}>
            <rect x="40" y="270" width="320" height="16" rx="8" fill="rgba(255,255,255,0.6)" />
            <rect x="130" y="150" width="140" height="110" rx="12" fill="rgba(255,255,255,0.8)" />
            <rect x="140" y="160" width="120" height="85" rx="6" fill="rgba(212,184,240,0.6)" />
            <rect x="185" y="260" width="30" height="12" rx="4" fill="rgba(255,255,255,0.8)" />
            <rect x="52" y="218" width="72" height="10" rx="3" fill="rgba(248,200,220,0.9)" />
            <rect x="56" y="228" width="68" height="10" rx="3" fill="rgba(184,232,212,0.9)" />
            <rect x="54" y="238" width="70" height="10" rx="3" fill="rgba(184,216,240,0.9)" />
            <rect x="52" y="248" width="72" height="22" rx="4" fill="rgba(255,255,255,0.7)" />
            <circle cx="200" cy="110" r="28" fill="rgba(255,255,255,0.7)" />
            <path d="M150 270 Q150 210 200 210 Q250 210 250 270" fill="rgba(255,255,255,0.5)" />
            <text x="310" y="100" fontSize="22" fill="rgba(255,255,255,0.8)">✦</text>
            <text x="70" y="130" fontSize="16" fill="rgba(255,255,255,0.7)">✦</text>
            <text x="340" y="200" fontSize="12" fill="rgba(255,255,255,0.6)">✦</text>
            <circle cx="320" cy="160" r="6" fill="rgba(255,255,255,0.6)" />
            <circle cx="336" cy="175" r="4" fill="rgba(255,255,255,0.5)" />
            <circle cx="350" cy="165" r="5" fill="rgba(255,255,255,0.55)" />
            <line x1="320" y1="160" x2="336" y2="175" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <line x1="336" y1="175" x2="350" y2="165" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          </svg>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'white', textAlign: 'center', marginTop: 24, textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
            Learn Together,<br />Grow Together
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 12, fontSize: '0.95rem', maxWidth: 280 }}>
            AI-powered study partner matching for India's ambitious students
          </p>
        </div>
      </div>

      {/* Right: form panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', minWidth: 340, maxWidth: 520, margin: '0 auto' }}>

        <button type="button" onClick={toggle} style={{ position: 'fixed', top: 20, right: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '7px 14px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.82rem', zIndex: 10 }}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Brand */}
          <Link to="/landing" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 28 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🧠</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>MindMatch</span>
          </Link>

          {/* ── LOGIN MODE ── */}
          {mode === 'login' && (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.95rem', color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.2 }}>Sign in to your account</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome back! Ready to continue learning?</p>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 7, fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>EMAIL OR PHONE NUMBER</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}>👤</span>
                    <input className="input-field" placeholder="your@email.com or 10-digit phone" value={form.identifier} onChange={e => set('identifier', e.target.value)} required style={{ paddingLeft: 38 }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <label style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>PASSWORD</label>
                    {/* Forgot password link */}
                    <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-body)', padding: 0 }}>
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}>🔒</span>
                    <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={e => set('password', e.target.value)} required style={{ paddingLeft: 38, paddingRight: 42 }} />
                    <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button className="btn-primary" type="submit" disabled={loading} style={{ padding: '13px', fontSize: '0.97rem', marginTop: 4, borderRadius: 'var(--radius-md)' }}>
                  {loading
                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Signing in...</span>
                    : 'Sign In →'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>New to MindMatch?</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <Link to="/register" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.92rem', textDecoration: 'none', transition: 'var(--transition)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
              >
                Create Free Account
              </Link>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <Link to="/landing" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to home</Link>
              </p>
            </>
          )}

          {/* ── FORGOT PASSWORD MODE ── */}
          {mode === 'forgot' && (
            <>
              <div style={{ marginBottom: 28 }}>
                <button type="button" onClick={() => { setMode('login'); setFpStep(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)', padding: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                  ← Back to login
                </button>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.2 }}>
                  {fpStep === 1 ? 'Forgot Password' : 'Reset Password'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {fpStep === 1
                    ? 'Enter your email or phone. We\'ll send an OTP to reset your password.'
                    : `OTP sent to ${fpEmail}. Enter it below with your new password.`}
                </p>
              </div>

              {/* Step indicator */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                {[1, 2].map(s => (
                  <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: s <= fpStep ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s' }} />
                ))}
              </div>

              {/* Step 1: Enter email/phone */}
              {fpStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 7, fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-secondary)' }}>EMAIL OR PHONE NUMBER</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>📧</span>
                      <input className="input-field" placeholder="your@email.com or 10-digit phone" value={fpEmail} onChange={e => setFpEmail(e.target.value)} style={{ paddingLeft: 38 }} />
                    </div>
                  </div>
                  <button type="button" className="btn-primary" onClick={handleForgotSend} disabled={fpLoading} style={{ padding: '13px', fontSize: '0.95rem' }}>
                    {fpLoading
                      ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Sending OTP...</span>
                      : 'Send OTP →'}
                  </button>
                </div>
              )}

              {/* Step 2: Enter OTP + new password */}
              {fpStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 7, fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-secondary)' }}>6-DIGIT OTP</label>
                    <input className="input-field" type="text" maxLength={6} placeholder="Enter OTP" value={fpOtp} onChange={e => setFpOtp(e.target.value.replace(/\D/g, ''))} style={{ letterSpacing: '6px', fontSize: '1.3rem', fontWeight: 700, textAlign: 'center' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 7, fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NEW PASSWORD</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🔒</span>
                      <input className="input-field" type="password" placeholder="Min. 6 characters" value={fpNewPass} onChange={e => setFpNewPass(e.target.value)} style={{ paddingLeft: 38 }} />
                    </div>
                  </div>
                  <button type="button" className="btn-primary" onClick={handleForgotReset} disabled={fpLoading} style={{ padding: '13px', fontSize: '0.95rem' }}>
                    {fpLoading
                      ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Resetting...</span>
                      : '🔓 Reset Password'}
                  </button>
                  <button type="button" onClick={() => setFpStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'var(--font-body)' }}>
                    ← Resend OTP
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 800px) { .login-left-panel { display: flex !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
