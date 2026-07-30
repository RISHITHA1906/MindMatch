import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Mentors() {
  const { API } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/mentors/`).then(r => setMentors(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [API]);

  return (
    <div style={{ padding: '28px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '6px' }}>🏆 Professional Mentors</h1>
        <p style={{ color: 'var(--text-muted)' }}>Highly rated contributors who have earned the Professional Mentor tag</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-lavender))', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: '28px' }}>
        <div style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '1rem', marginBottom: '6px' }}>🏆 How to Become a Mentor</div>
        <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '16px' }}>
          <li>Maintain a rating of 4.5+ from at least 5 learners</li>
          <li>Teach skills consistently and get positive reviews</li>
          <li>Earn incentives: scholarship coupons, mobile recharges, internship opportunities</li>
        </ul>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading mentors...</div>}

      {!loading && mentors.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏆</div>
          <div>No mentors yet – be the first to earn this distinction!</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '16px' }}>
        {mentors.map((m, i) => (
          <div key={m.id} className="card fade-in" style={{ border: '2px solid', borderImage: 'linear-gradient(135deg, var(--primary), var(--secondary)) 1', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.3rem', overflow: 'hidden' }}>
                  {m.avatar ? <img src={m.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.name?.[0]}
                </div>
                {i === 0 && <div style={{ position: 'absolute', top: -4, right: -4, fontSize: '0.9rem' }}>👑</div>}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{m.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.college}</div>
                <span className="mentor-badge">🏆 Professional Mentor</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>⭐ {m.reputation_score}/5</span>
              <span>📅 {m.total_sessions} sessions</span>
            </div>
            {m.bio && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>{m.bio.slice(0, 100)}{m.bio.length > 100 ? '...' : ''}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
              {m.skills_have?.slice(0, 4).map(s => <span key={s} className="tag">{s}</span>)}
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '8px' }} onClick={() => navigate(`/chat/${m.id}`)}>💬 Learn from this Mentor</button>
          </div>
        ))}
      </div>
    </div>
  );
}
