import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import VideoCall from './VideoCall';

export default function IncomingCall() {
  const { on, off } = useSocket();
  const [call, setCall] = useState(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const handler = (data) => {
      setCall(data);
      setAccepted(false);
    };
    on('incoming_call', handler);
    return () => off('incoming_call', handler);
  }, [on, off]);

  if (!call) return null;

  if (accepted) {
    return <VideoCall
      peer={{ id: call.from, name: call.from_name }}
      callType={call.call_type || 'video'}
      isIncoming
      incomingOffer={call.offer}
      callerId={call.from}
      onEnd={() => { setCall(null); setAccepted(false); }}
    />;
  }

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)', padding: '20px 24px',
      boxShadow: 'var(--shadow-lg)', zIndex: 999,
      display: 'flex', flexDirection: 'column', gap: '12px',
      minWidth: '280px', animation: 'slideIn 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '1.8rem', animation: 'pulse 1.2s ease infinite' }}>{call.call_type === 'audio' ? '📞' : '🎥'}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Incoming {call.call_type === 'audio' ? 'Audio' : 'Video'} Call</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{call.from_name}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => setAccepted(true)} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-full)', background: '#22c55e', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>✅ Accept</button>
        <button onClick={() => setCall(null)} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-full)', background: '#ef4444', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>❌ Decline</button>
      </div>
      <style>{`@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }`}</style>
    </div>
  );
}
