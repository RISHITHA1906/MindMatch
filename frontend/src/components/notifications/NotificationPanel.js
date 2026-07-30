import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationPanel() {
  const { API } = useAuth();
  const { on, off } = useSocket();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef();

  const fetchNotifs = () => {
    axios.get(`${API}/notifications/`).then(r => {
      setNotifs(r.data);
      setUnread(r.data.filter(n => !n.read).length);
    }).catch(() => {});
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (n) => {
      setNotifs(prev => [n, ...prev.slice(0, 49)]);
      setUnread(u => u + 1);
      if (Notification.permission === 'granted') {
        new Notification(n.title, { body: n.message });
      }
    };
    on('new_notification', handler);
    return () => off('new_notification', handler);
  }, [on, off]);

  useEffect(() => {
    if (Notification.permission === 'default') Notification.requestPermission();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    axios.post(`${API}/notifications/mark-read`, {}).then(() => {
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    });
  };

  const handleClick = (n) => {
    if (!n.read) {
      axios.post(`${API}/notifications/mark-read`, { notification_id: n.id });
      setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      setUnread(u => Math.max(0, u - 1));
    }
    if (n.type === 'message' && n.meta?.sender_id) navigate(`/chat/${n.meta.sender_id}`);
    else if (n.type === 'match_request') navigate('/matching');
    else if (n.type === 'missed_call' && n.meta?.caller_id) navigate(`/chat/${n.meta.caller_id}`);
    setOpen(false);
  };

  const typeIcon = { message: '💬', match_request: '🔗', match_response: '✅', missed_call: '📵', info: 'ℹ️' };

  return (
    /* Relative wrapper — panel anchors to where it's placed in the DOM (Dashboard header) */
    <div ref={panelRef} style={{ position: 'relative', zIndex: 200 }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative',
          width: 42, height: 42,
          borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.15rem',
          boxShadow: 'var(--shadow-md)',
          transition: 'var(--transition)',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -3, right: -3,
            background: 'var(--primary)', color: 'white',
            borderRadius: '50%', minWidth: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.62rem', fontWeight: 700,
            border: '2px solid var(--bg-primary)',
            lineHeight: 1,
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {/* Dropdown panel — anchored to top-right */}
      {open && (
        <div style={{
          position: 'absolute', top: 50, right: 0,
          width: 340, maxWidth: 'calc(100vw - 32px)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'fadeIn 0.18s ease',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>🔔 Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔔</div>
                No notifications yet
              </div>
            ) : notifs.map(n => (
              <div key={n.id} onClick={() => handleClick(n)} style={{
                padding: '12px 16px', cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                background: n.read ? 'transparent' : 'rgba(232,122,170,0.08)',
                transition: 'background 0.15s',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(232,122,170,0.08)'}
              >
                <span style={{ fontSize: '1.15rem', flexShrink: 0, marginTop: 1 }}>{typeIcon[n.type] || '🔔'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: n.read ? 500 : 700, fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3 }}>
                    {n.created_at ? new Date(n.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 5 }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
