import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SkillBarter() {
  const { user, API } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches]   = useState([]);
  const [txs, setTxs]           = useState([]);
  const [tab, setTab]           = useState('barter');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // Load mutual matches (accepted) for barter
    axios.get(`${API}/match-requests/accepted`)
      .then(r => {
        // Build barter-compatible objects from accepted matches
        const barterList = r.data.map(req => {
          const partner = req.from_user?.id === user?.id ? req.to_user : req.from_user;
          if (!partner) return null;
          return {
            id: partner.id,
            name: partner.name,
            avatar: partner.avatar,
            college: partner.college,
            can_teach_you: partner.skills_have || [],
            you_can_teach: partner.skills_want || [],
            match_score: req.match_score || 0,
            skill_credits: partner.skill_credits || 0,
          };
        }).filter(Boolean);
        setMatches(barterList);
      })
      .catch(() => {
        // Fallback to old endpoint
        axios.get(`${API}/matching/skill-barter`).then(r => setMatches(r.data)).catch(() => {});
      })
      .finally(() => setLoading(false));

    axios.get(`${API}/skills/transactions`).then(r => setTxs(r.data)).catch(() => {});
  }, [API, user]);

  const sendCredits = async (toId, name) => {
    const amount = parseInt(prompt(`How many credits to send to ${name}? (You have ${user?.skill_credits})`));
    if (!amount || isNaN(amount) || amount <= 0) return;
    try {
      await axios.post(`${API}/skills/transfer`, { to_user_id: toId, amount, reason: 'Skill exchange' });
      toast.success(`Sent ${amount} credits to ${name}! 💎`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Transfer failed');
    }
  };

  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: 4, color: 'var(--text-primary)' }}>🔄 Skill Barter</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Exchange skills with your mutual matches — teach what you know, learn what you want</p>
      </div>

      {/* Credits Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 'var(--radius-lg)', padding: '18px 22px', marginBottom: 22, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.82rem', opacity: 0.85, marginBottom: 4 }}>Your Skill Credits</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>💎 {user?.skill_credits || 0}</div>
        </div>
        <div style={{ opacity: 0.85, fontSize: '0.8rem', textAlign: 'right' }}>
          <div>Teach skills → Earn credits</div>
          <div>Spend credits → Learn skills</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[['barter','🔄 Barter Matches'],['history','📜 Credit History']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '8px 18px', borderRadius: 'var(--radius-full)',
            background: tab === k ? 'var(--primary)' : 'var(--bg-card)',
            color: tab === k ? 'white' : 'var(--text-secondary)',
            fontWeight: 600, cursor: 'pointer', fontSize: '0.83rem',
            border: tab === k ? 'none' : '1px solid var(--border)',
          }}>{l}</button>
        ))}
      </div>

      {tab === 'barter' && (
        loading
          ? <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading your barter matches...</div>
          : matches.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔄</div>
                <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>No barter matches yet</div>
                <div style={{ fontSize: '0.85rem', marginBottom: 16 }}>Barter is unlocked when you mutually accept a match request</div>
                <button className="btn-primary" onClick={() => navigate('/matching')}>🔍 Find Partners</button>
              </div>
            )
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 16 }}>
                {matches.map(m => (
                  <div key={m.id} className="card fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', overflow: 'hidden', flexShrink: 0 }}>
                        {m.avatar ? <img src={m.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.name?.[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.93rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{m.college}</div>
                      </div>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(34,197,94,0.1)', color: '#166534', fontWeight: 600 }}>✅ Matched</span>
                    </div>

                    {m.can_teach_you?.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 5 }}>They can teach YOU</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {m.can_teach_you.map(s => <span key={s} className="tag" style={{ background: 'var(--accent-mint)', color: '#1a5a3a' }}>{s}</span>)}
                        </div>
                      </div>
                    )}

                    {m.you_can_teach?.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 5 }}>YOU can teach them</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {m.you_can_teach.map(s => <span key={s} className="tag" style={{ background: 'var(--accent-lavender)', color: 'var(--secondary)' }}>{s}</span>)}
                        </div>
                      </div>
                    )}

                    {m.can_teach_you?.length === 0 && m.you_can_teach?.length === 0 && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>Complete your skill profile to see barter opportunities!</p>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-primary" style={{ flex: 1, fontSize: '0.82rem', padding: '8px' }}
                        onClick={() => navigate(`/chat/${m.id}`)}>💬 Chat</button>
                      <button className="btn-secondary" style={{ flex: 1, fontSize: '0.82rem', padding: '8px' }}
                        onClick={() => sendCredits(m.id, m.name)}>💎 Send Credits</button>
                    </div>
                  </div>
                ))}
              </div>
            )
      )}

      {tab === 'history' && (
        txs.length === 0
          ? <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No credit transactions yet</div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {txs.map((t, i) => (
                <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: t.amount > 0 ? 'var(--accent-mint)' : 'var(--accent-peach)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                    {t.amount > 0 ? '📥' : '📤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.reason || 'Skill exchange'}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{t.other_user?.name} · {new Date(t.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: t.amount > 0 ? '#166534' : '#b45309', flexShrink: 0 }}>
                    {t.amount > 0 ? '+' : ''}{t.amount} 💎
                  </div>
                </div>
              ))}
            </div>
          )
      )}
    </div>
  );
}
