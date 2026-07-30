import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export default function Matching() {
  const { user, API } = useAuth();
  const { emit } = useSocket();
  const navigate = useNavigate();
  const [partners, setPartners]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('');
  const [incoming, setIncoming]       = useState([]);
  const [outgoing, setOutgoing]       = useState([]);
  const [accepted, setAccepted]       = useState([]);
  const [tab, setTab]                 = useState('recommended'); // recommended | sent | received | accepted
  const [profileModal, setProfileModal] = useState(null); // user object to show in modal

  const loadAll = () => {
    setLoading(true);
    axios.get(`${API}/matching/partners`)
      .then(r => setPartners(r.data))
      .catch(() => toast.error('Failed to load matches'))
      .finally(() => setLoading(false));
    axios.get(`${API}/match-requests/incoming`).then(r => setIncoming(r.data)).catch(() => {});
    axios.get(`${API}/match-requests/outgoing`).then(r => setOutgoing(r.data)).catch(() => {});
    axios.get(`${API}/match-requests/accepted`).then(r => setAccepted(r.data)).catch(() => {});
  };

  useEffect(() => { loadAll(); }, [API]);

  const sendMatchRequest = async (partnerId, partnerName) => {
    try {
      await axios.post(`${API}/match-requests/send/${partnerId}`);
      setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, match_status: 'request_sent' } : p));
      setOutgoing(prev => [...prev, { id: Date.now(), to_user: partners.find(p => p.id === partnerId), status: 'pending' }]);
      if (emit) emit('match_request_sent', { to_id: partnerId, from_name: user?.name });
      toast.success(`Match request sent to ${partnerName}! ✨`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request');
    }
  };

  const respondRequest = async (reqId, action, fromName, fromId) => {
    try {
      await axios.post(`${API}/match-requests/respond/${reqId}`, { action });
      const req = incoming.find(r => r.id === reqId);
      setIncoming(prev => prev.filter(r => r.id !== reqId));
      if (action === 'accept') {
        setPartners(prev => prev.map(p => p.id === fromId ? { ...p, match_status: 'accepted' } : p));
        if (req) setAccepted(prev => [...prev, { ...req, status: 'accepted' }]);
        toast.success(`🎉 You're now matched with ${fromName}!`);
      } else {
        toast.success('Request declined');
      }
    } catch { toast.error('Failed to respond'); }
  };

  const matchColor = s => s >= 70 ? '#22c55e' : s >= 40 ? '#f59e0b' : 'var(--primary)';

  // Recommended = partners with no status yet, sorted by score desc, with highly recommended at top
  const recommended = partners
    .filter(p => {
      const q = filter.toLowerCase();
      const matchesFilter = !filter ||
        p.name?.toLowerCase().includes(q) ||
        p.subjects?.some(s => s.toLowerCase().includes(q)) ||
        p.skills_have?.some(s => s.toLowerCase().includes(q)) ||
        p.skills_want?.some(s => s.toLowerCase().includes(q));
      return matchesFilter && (!p.match_status || p.match_status === 'none');
    })
    .sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

  const highlyRecommended = recommended.filter(p => (p.match_score || 0) >= 60);
  const others = recommended.filter(p => (p.match_score || 0) < 60);

  const TABS = [
    { id: 'recommended', label: '🔥 Recommended',   count: recommended.length },
    { id: 'sent',        label: '📤 Sent',           count: outgoing.length },
    { id: 'received',    label: '📩 Received',       count: incoming.length, highlight: incoming.length > 0 },
    { id: 'accepted',    label: '✅ Matched',        count: accepted.length },
  ];

  const PartnerCard = ({ p, showSentTag, showReceivedTag, showAcceptedTag }) => {
    const score = p.match_score || 0;
    const status = p.match_status;
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 11, padding: '16px', animation: 'fadeIn 0.3s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0, overflow: 'hidden' }}>
            {p.avatar ? <img src={p.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.name?.[0] || '?')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.93rem', color: 'var(--text-primary)' }}>{p.name}</span>
              {p.mentor_tag && <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'var(--accent-yellow)', color: '#5a4000', padding: '1px 7px', borderRadius: 'var(--radius-full)' }}>🏆 Mentor</span>}
              {p.online && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} title="Online" />}
              {showSentTag && <span style={{ fontSize: '0.65rem', background: 'rgba(245,158,11,0.15)', color: '#b45309', padding: '1px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>📤 Sent</span>}
              {showReceivedTag && <span style={{ fontSize: '0.65rem', background: 'rgba(155,124,212,0.15)', color: 'var(--secondary)', padding: '1px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>📩 Wants to Match</span>}
              {showAcceptedTag && <span style={{ fontSize: '0.65rem', background: 'rgba(34,197,94,0.15)', color: '#166534', padding: '1px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>✅ Matched</span>}
            </div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {p.college}{p.year ? ` · ${p.year}` : ''}{p.preparation_level ? ` · ${p.preparation_level}` : ''}
            </div>
            {p.reputation_score > 0 && <div style={{ fontSize: '0.71rem', color: '#f59e0b', marginTop: 2 }}>⭐ {p.reputation_score}/5</div>}
          </div>
          {/* Score */}
          {score > 0 && (
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: matchColor(score), lineHeight: 1 }}>{score}%</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>match</div>
              <div style={{ width: 48, height: 3, borderRadius: 99, background: 'var(--border)', marginTop: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${score}%`, background: matchColor(score), borderRadius: 99 }} />
              </div>
            </div>
          )}
        </div>

        {/* Match reasons */}
        {p.match_reasons?.length > 0 && (
          <div style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', padding: '7px 10px' }}>
            {p.match_reasons.slice(0, 2).map((r, i) => (
              <div key={i} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                <span style={{ color: '#22c55e', fontWeight: 700, flexShrink: 0 }}>✓</span> {r}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {p.skills_have?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>⭐ Can Teach</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {p.skills_have.slice(0, 3).map(s => <span key={s} style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.68rem', background: 'rgba(34,197,94,0.1)', color: '#166534', fontWeight: 500 }}>{s}</span>)}
                {p.skills_have.length > 3 && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>+{p.skills_have.length - 3}</span>}
              </div>
            </div>
          )}
          {p.skills_want?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>🎓 Wants</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {p.skills_want.slice(0, 3).map(s => <span key={s} style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.68rem', background: 'rgba(155,124,212,0.12)', color: 'var(--secondary)', fontWeight: 500 }}>{s}</span>)}
                {p.skills_want.length > 3 && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>+{p.skills_want.length - 3}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          {/* View Profile button */}
          <button type="button" className="btn-secondary" style={{ padding: '7px 12px', fontSize: '0.8rem', flexShrink: 0 }}
            onClick={() => setProfileModal(p)}>👤 Profile</button>

          {/* Match action */}
          {(!status || status === 'none') ? (
            <button type="button" className="btn-primary" style={{ flex: 1, padding: '7px', fontSize: '0.8rem' }}
              onClick={() => sendMatchRequest(p.id, p.name)}>🤝 Match</button>
          ) : status === 'request_sent' ? (
            <div style={{ flex: 1, padding: '7px', borderRadius: 'var(--radius-full)', background: 'rgba(245,158,11,0.1)', color: '#b45309', fontWeight: 600, fontSize: '0.8rem', textAlign: 'center', border: '1px solid rgba(245,158,11,0.25)' }}>⏳ Request Sent</div>
          ) : status === 'accepted' ? (
            <button type="button" className="btn-primary" style={{ flex: 1, padding: '7px', fontSize: '0.8rem' }}
              onClick={() => navigate('/barter')}>🔄 Go to Barter</button>
          ) : status === 'request_received' ? (
            <div style={{ flex: 1, padding: '7px', borderRadius: 'var(--radius-full)', background: 'var(--accent-lavender)', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.8rem', textAlign: 'center' }}>📩 Pending</div>
          ) : null}

          <button type="button" className="btn-secondary" style={{ flex: 1, padding: '7px', fontSize: '0.8rem' }}
            onClick={() => navigate(`/chat/${p.id}`)}>💬 Chat</button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px 16px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: 4, color: 'var(--text-primary)' }}>🔍 Find Study Partners</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>AI-matched based on your exams, skills & availability</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', border: t.highlight && tab !== t.id ? '2px solid var(--primary)' : '1px solid var(--border)', background: tab === t.id ? 'var(--primary)' : 'var(--bg-card)', color: tab === t.id ? 'white' : t.highlight ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            {t.label}
            {t.count > 0 && <span style={{ background: tab === t.id ? 'rgba(255,255,255,0.3)' : 'var(--accent-pink)', color: tab === t.id ? 'white' : 'var(--primary-dark)', borderRadius: 'var(--radius-full)', padding: '1px 7px', fontSize: '0.72rem', fontWeight: 700 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Filter (only on recommended) */}
      {tab === 'recommended' && (
        <div style={{ position: 'relative', maxWidth: 400, marginBottom: 20 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🔎</span>
          <input className="input-field" placeholder="Filter by name, subject, skill..." value={filter} onChange={e => setFilter(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      )}

      {/* ── RECOMMENDED TAB ── */}
      {tab === 'recommended' && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 10, animation: 'spin 1s linear infinite', display: 'inline-block' }}>🧠</div>
              <div>AI is finding your best matches...</div>
            </div>
          ) : (
            <>
              {/* Highly Recommended section */}
              {highlyRecommended.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>🔥 Highly Recommended</div>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>60%+ match score</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 14, marginBottom: 24 }}>
                    {highlyRecommended.map(p => <PartnerCard key={p.id} p={p} />)}
                  </div>
                </>
              )}

              {/* Other matches */}
              {others.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>👥 More Partners</div>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 14 }}>
                    {others.map(p => <PartnerCard key={p.id} p={p} />)}
                  </div>
                </>
              )}

              {recommended.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔍</div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>No partners found</div>
                  <div style={{ fontSize: '0.85rem' }}>Add more subjects & skills to your profile for better AI matches</div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── SENT REQUESTS TAB ── */}
      {tab === 'sent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {outgoing.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>📤</div>
              <div style={{ fontWeight: 600 }}>No requests sent yet</div>
              <div style={{ fontSize: '0.85rem', marginTop: 6 }}>Go to Recommended tab to send match requests</div>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>People you've sent a match request to. Waiting for their response.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 14 }}>
                {outgoing.map(req => (
                  <PartnerCard key={req.id} p={{ ...req.to_user, match_status: 'request_sent' }} showSentTag />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── RECEIVED REQUESTS TAB ── */}
      {tab === 'received' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {incoming.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>📩</div>
              <div style={{ fontWeight: 600 }}>No incoming requests</div>
              <div style={{ fontSize: '0.85rem', marginTop: 6 }}>When someone sends you a match request, it appears here</div>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>People who want to study with you. View their profile and decide!</p>
              {incoming.map(req => (
                <div key={req.id} style={{ background: 'var(--bg-card)', border: '2px solid var(--accent-lavender)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', gap: 14, flexWrap: 'wrap', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', overflow: 'hidden', flexShrink: 0 }}>
                        {req.from_user?.avatar ? <img src={req.from_user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : req.from_user?.name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.93rem', color: 'var(--text-primary)' }}>{req.from_user?.name}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{req.from_user?.college} · {req.from_user?.subjects?.slice(0,2).join(', ')}</div>
                      </div>
                    </div>
                    {req.from_user?.skills_have?.length > 0 && (
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Can teach</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                          {req.from_user.skills_have.slice(0,4).map(s => <span key={s} style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.68rem', background: 'rgba(34,197,94,0.1)', color: '#166534', fontWeight: 500 }}>{s}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center', flexShrink: 0 }}>
                    <button type="button" className="btn-secondary" style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                      onClick={() => setProfileModal(req.from_user)}>👤 View Profile</button>
                    <button type="button" className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                      onClick={() => respondRequest(req.id, 'accept', req.from_user?.name, req.from_user?.id)}>✅ Accept</button>
                    <button type="button" className="btn-secondary" style={{ padding: '7px 14px', fontSize: '0.8rem', borderColor: 'var(--border)' }}
                      onClick={() => respondRequest(req.id, 'decline', req.from_user?.name, req.from_user?.id)}>✕ Decline</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── ACCEPTED / MATCHED TAB ── */}
      {tab === 'accepted' && (
        <div>
          {accepted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>✅</div>
              <div style={{ fontWeight: 600 }}>No mutual matches yet</div>
              <div style={{ fontSize: '0.85rem', marginTop: 6 }}>When both of you accept each other, you appear here and in Skill Barter</div>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 14 }}>These are your mutual matches — you can barter skills and schedule sessions with them!</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 14 }}>
                {accepted.map(req => {
                  const person = req.from_user?.id === user?.id ? req.to_user : req.from_user;
                  return <PartnerCard key={req.id} p={{ ...person, match_status: 'accepted' }} showAcceptedTag />;
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Profile Modal ── */}
      {profileModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setProfileModal(null); }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: 28, maxWidth: 480, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text-primary)' }}>👤 Partner Profile</h2>
              <button onClick={() => setProfileModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.5rem', overflow: 'hidden', flexShrink: 0 }}>
                {profileModal.avatar ? <img src={profileModal.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : profileModal.name?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{profileModal.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{profileModal.college}{profileModal.year ? ` · ${profileModal.year}` : ''}</div>
                {profileModal.reputation_score > 0 && <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: 2 }}>⭐ {profileModal.reputation_score}/5</div>}
              </div>
            </div>
            {profileModal.bio && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.6 }}>{profileModal.bio}</p>}
            {profileModal.subjects?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>📚 Studying / Preparing</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {profileModal.subjects.map(s => <span key={s} style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', background: 'var(--accent-sky)', color: 'var(--text-secondary)', fontWeight: 500 }}>{s}</span>)}
                </div>
              </div>
            )}
            {profileModal.skills_have?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>⭐ Can Teach</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {profileModal.skills_have.map(s => <span key={s} style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', background: 'rgba(34,197,94,0.1)', color: '#166534', fontWeight: 500 }}>{s}</span>)}
                </div>
              </div>
            )}
            {profileModal.skills_want?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>🎓 Wants to Learn</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {profileModal.skills_want.map(s => <span key={s} style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', background: 'rgba(155,124,212,0.12)', color: 'var(--secondary)', fontWeight: 500 }}>{s}</span>)}
                </div>
              </div>
            )}
            {profileModal.availability?.length > 0 && (
              <div style={{ marginBottom: 16, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                📅 Available: {profileModal.availability.join(', ')}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => { navigate(`/chat/${profileModal.id}`); setProfileModal(null); }}>💬 Chat</button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setProfileModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
