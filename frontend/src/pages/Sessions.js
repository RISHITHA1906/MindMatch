import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Sessions() {
  const { API } = useAuth();
  const [sessions, setSessions]   = useState([]);
  const [showing, setShowing]     = useState(false);
  const [partners, setPartners]   = useState([]);
  const [form, setForm]           = useState({ partner_id: '', subject: '', scheduled_at: '', duration: 60, notes: '' });
  const notifiedRef               = useRef(new Set()); // track already-notified session IDs

  // Load sessions + only mutually accepted partners
  useEffect(() => {
    axios.get(`${API}/sessions/`).then(r => setSessions(r.data)).catch(() => {});
    // Only accepted matches should appear as partner options
    axios.get(`${API}/match-requests/accepted`)
      .then(r => {
        // accepted returns array with from_user/to_user — flatten to the partner
        const people = r.data.map(req => req.to_user || req.from_user).filter(Boolean);
        setPartners(people);
      })
      .catch(() => {
        // Fallback: use all partners if endpoint not available
        axios.get(`${API}/matching/partners`).then(r => setPartners(r.data.slice(0, 20))).catch(() => {});
      });
  }, [API]);

  // Notification checker — runs every 30 seconds
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      sessions.forEach(s => {
        if (s.status !== 'scheduled' || !s.scheduled_at) return;
        if (notifiedRef.current.has(s.id)) return;
        const sessionTime = new Date(s.scheduled_at);
        const diffMs = sessionTime - now;
        const diffMin = diffMs / 60000;
        // Notify 10 minutes before
        if (diffMin <= 10 && diffMin > 0) {
          notifiedRef.current.add(s.id);
          toast(`⏰ Reminder: Session with ${s.partner?.name || 'your partner'} on "${s.subject}" starts in ${Math.ceil(diffMin)} minutes!`,
            { duration: 8000, icon: '📅' });
          // Browser notification
          if (Notification.permission === 'granted') {
            new Notification('MindMatch Session Reminder', {
              body: `Your session on "${s.subject}" with ${s.partner?.name || 'your partner'} starts in ${Math.ceil(diffMin)} minutes!`,
              icon: '/favicon.ico',
            });
          }
        }
        // Notify at exact time
        if (diffMin <= 0 && diffMin > -2) {
          notifiedRef.current.add(s.id + '_start');
          toast(`🚀 Your session "${s.subject}" with ${s.partner?.name || 'your partner'} is starting now!`,
            { duration: 10000, icon: '🎯' });
        }
      });
    };

    // Request browser notification permission on mount
    if (Notification.permission === 'default') Notification.requestPermission();

    const interval = setInterval(checkNotifications, 30000);
    checkNotifications(); // run immediately on load
    return () => clearInterval(interval);
  }, [sessions]);

  const create = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API}/sessions/`, form);
      setSessions(prev => [data, ...prev]);
      setShowing(false);
      setForm({ partner_id: '', subject: '', scheduled_at: '', duration: 60, notes: '' });
      toast.success('Session scheduled! Both partners will be notified 10 minutes before.');
    } catch { toast.error('Failed to schedule session'); }
  };

  const statusColor = {
    scheduled:  'var(--accent-sky)',
    completed:  'var(--accent-mint)',
    cancelled:  'var(--accent-peach)',
  };

  const Lbl = ({ children }) => (
    <label style={{ display: 'block', marginBottom: 5, fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {children}
    </label>
  );

  return (
    <div style={{ padding: '20px 16px', maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: 4, color: 'var(--text-primary)' }}>📅 Study Sessions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Schedule sessions with your matched partners — get notified 10 mins before</p>
        </div>
        <button className="btn-primary" onClick={() => setShowing(s => !s)}>
          {showing ? '✕ Cancel' : '+ Schedule Session'}
        </button>
      </div>

      {/* Schedule form */}
      {showing && (
        <div className="card fade-in" style={{ marginBottom: 24, border: '2px solid var(--primary)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16, color: 'var(--text-primary)' }}>New Study Session</h3>

          {partners.length === 0 && (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16, fontSize: '0.85rem', color: '#b45309' }}>
              ⚠️ No matched partners yet. Go to <strong>Find Partners</strong> and accept a match request first!
            </div>
          )}

          <form onSubmit={create} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Partner */}
            <div style={{ gridColumn: '1/-1' }}>
              <Lbl>Study Partner *</Lbl>
              <select className="input-field" value={form.partner_id} onChange={e => setForm(f => ({ ...f, partner_id: e.target.value }))} required>
                <option value="">Select your matched partner...</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.name}{p.college ? ` — ${p.college}` : ''}</option>)}
              </select>
            </div>

            {/* Subject — free text input */}
            <div style={{ gridColumn: '1/-1' }}>
              <Lbl>Subject / Topic *</Lbl>
              <input
                className="input-field"
                placeholder="e.g. Organic Chemistry, Dynamic Programming, Calculus, UPSC Polity..."
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                required
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Type anything — be as specific as you want</div>
            </div>

            {/* Date & time */}
            <div>
              <Lbl>Date & Time *</Lbl>
              <input className="input-field" type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} required />
            </div>

            {/* Duration */}
            <div>
              <Lbl>Duration</Lbl>
              <select className="input-field" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}>
                {[30,45,60,90,120,180].map(d => <option key={d} value={d}>{d} minutes{d >= 60 ? ` (${d/60}h)` : ''}</option>)}
              </select>
            </div>

            {/* Notes */}
            <div style={{ gridColumn: '1/-1' }}>
              <Lbl>Notes / Agenda</Lbl>
              <textarea className="input-field" placeholder="What will you cover? Any specific chapters, problems, or goals?" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} style={{ resize: 'vertical' }} />
            </div>

            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10 }}>
              <button className="btn-primary" type="submit">📅 Schedule</button>
              <button className="btn-secondary" type="button" onClick={() => setShowing(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Session list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sessions.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📅</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>No sessions yet</div>
            <div style={{ fontSize: '0.85rem' }}>Schedule your first study session with a matched partner!</div>
          </div>
        )}
        {sessions.map(s => (
          <div key={s.id} className="card fade-in" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: statusColor[s.status] || 'var(--accent-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>📚</div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{s.subject}</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: statusColor[s.status], fontWeight: 600, color: 'var(--text-primary)' }}>{s.status}</span>
                {s.is_host && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>you hosted</span>}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                with <strong style={{ color: 'var(--text-primary)' }}>{s.partner?.name || 'Unknown'}</strong>
                {s.scheduled_at && ` · ${new Date(s.scheduled_at).toLocaleString()}`}
                {s.duration && ` · ${s.duration} min`}
              </div>
              {s.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>{s.notes}</div>}
            </div>
            {s.status === 'scheduled' && (
              <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem', flexShrink: 0 }}
                onClick={() => {
                  axios.put(`${API}/sessions/${s.id}`, { status: 'completed' });
                  toast.success('Marked as complete! Credits earned.');
                  setSessions(prev => prev.map(x => x.id === s.id ? { ...x, status: 'completed' } : x));
                }}>
                ✅ Complete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
