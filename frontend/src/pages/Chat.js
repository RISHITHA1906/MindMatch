import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import VideoCall from '../components/video/VideoCall';
import toast from 'react-hot-toast';

function roomId(a, b) { return [a, b].sort().join('_'); }

export default function Chat() {
  const { userId } = useParams();
  const { user, API } = useAuth();
  const { emit, on, off } = useSocket();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState('video');
  const [callPeer, setCallPeer] = useState(null);
  const bottomRef = useRef();
  const fileRef = useRef();
  const typingTimer = useRef();

  const fetchRooms = useCallback(() => {
    axios.get(`${API}/chat/rooms`).then(r => setRooms(r.data)).catch(() => {});
  }, [API]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  useEffect(() => {
    if (userId) {
      axios.get(`${API}/users/${userId}`).then(r => {
        openChat(r.data);
      }).catch(() => {});
    }
  }, [userId, API]);

  const openChat = useCallback((otherUser) => {
    setActiveRoom(otherUser);
    const rid = roomId(user.id, otherUser.id);
    emit('join', { room: rid, user_id: user.id });
    axios.get(`${API}/chat/rooms/${otherUser.id}/messages`).then(r => {
      setMessages(r.data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }).catch(() => {});
    fetchRooms();
  }, [user, emit, API, fetchRooms]);

  useEffect(() => {
    const handleMsg = (msg) => {
      if (activeRoom && msg.sender_id !== user.id) {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    };
    const handleTyping = (d) => {
      if (d.user_id !== user.id) setOtherTyping(d.typing);
    };
    on('receive_message', handleMsg);
    on('user_typing', handleTyping);
    return () => { off('receive_message', handleMsg); off('user_typing', handleTyping); };
  }, [activeRoom, user, on, off]);

  const sendMessage = async (content, type = 'text', file_url = '', file_name = '') => {
    if (!content.trim() && !file_url) return;
    const rid = roomId(user.id, activeRoom.id);
    try {
      const { data } = await axios.post(`${API}/chat/rooms/${activeRoom.id}/send`, { content, type, file_url, file_name });
      setMessages(prev => [...prev, data]);
      emit('send_message', { room_id: rid, sender_id: user.id, ...data });
      setInput('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      fetchRooms();
    } catch { toast.error('Failed to send message'); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      toast.loading('Uploading...');
      const { data } = await axios.post(`${API}/chat/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.dismiss();
      const isImage = file.type.startsWith('image/');
      await sendMessage(isImage ? '📷 Image' : `📎 ${file.name}`, isImage ? 'image' : 'file', data.file_url, data.file_name);
    } catch { toast.dismiss(); toast.error('Upload failed'); }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!typing) {
      setTyping(true);
      emit('typing', { room_id: roomId(user.id, activeRoom?.id), user_id: user.id, typing: true });
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setTyping(false);
      emit('typing', { room_id: roomId(user.id, activeRoom?.id), user_id: user.id, typing: false });
    }, 1500);
  };

  const startCall = (type) => {
    setCallType(type);
    setCallPeer(activeRoom);
    setInCall(true);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', borderRight: '1px solid var(--border)', background: 'var(--bg-sidebar)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '10px' }}>💬 Messages</h2>
          <button className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.82rem' }} onClick={() => navigate('/matching')}>+ New Chat</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {rooms.length === 0 && <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No conversations yet</div>}
          {rooms.map(r => (
            <div key={r.room_id} onClick={() => openChat(r.other_user)} style={{
              padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
              background: activeRoom?.id === r.other_user.id ? 'var(--bg-hover)' : 'transparent',
              transition: 'var(--transition)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, overflow: 'hidden' }}>
                    {r.other_user.avatar ? <img src={r.other_user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : r.other_user.name?.[0]}
                  </div>
                  {r.other_user.online && <span className="online-dot" style={{ position: 'absolute', bottom: 0, right: 0 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.other_user.name}</span>
                    {r.unread_count > 0 && <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.7rem', fontWeight: 700, borderRadius: '50%', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.unread_count}</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.last_message || 'Start a conversation'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {activeRoom ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, overflow: 'hidden' }}>
                {activeRoom.avatar ? <img src={activeRoom.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : activeRoom.name?.[0]}
              </div>
              {activeRoom.online && <span className="online-dot" style={{ position: 'absolute', bottom: 0, right: 0 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{activeRoom.name}</div>
              <div style={{ fontSize: '0.75rem', color: activeRoom.online ? '#4ade80' : 'var(--text-muted)' }}>
                {activeRoom.online ? 'Online' : 'Offline'}
              </div>
            </div>
            <button onClick={() => startCall('audio')} title="Audio call" style={{ background: 'var(--accent-mint)', border: 'none', borderRadius: '50%', width: 38, height: 38, fontSize: '1.1rem', cursor: 'pointer' }}>📞</button>
            <button onClick={() => startCall('video')} title="Video call" style={{ background: 'var(--accent-sky)', border: 'none', borderRadius: '50%', width: 38, height: 38, fontSize: '1.1rem', cursor: 'pointer' }}>🎥</button>
            <button onClick={() => navigate(`/profile/${activeRoom.id}`)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '6px 12px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Profile</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.map((m, i) => {
              const isMine = m.sender_id === user.id;
              return (
                <div key={m.id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '68%', padding: '10px 14px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMine ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-card)',
                    color: isMine ? 'white' : 'var(--text-primary)',
                    border: isMine ? 'none' : '1px solid var(--border)',
                    fontSize: '0.9rem', lineHeight: 1.5, wordBreak: 'break-word'
                  }}>
                    {m.type === 'image' && m.file_url && <img src={`http://localhost:5000${m.file_url}`} alt="img" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: m.content ? '6px' : 0 }} />}
                    {m.type === 'file' && m.file_url && <a href={`http://localhost:5000${m.file_url}`} target="_blank" rel="noreferrer" style={{ color: isMine ? 'white' : 'var(--primary)', textDecoration: 'underline', fontSize: '0.85rem' }}>📎 {m.file_name || 'Download file'}</a>}
                    {m.content && m.type === 'text' && <span>{m.content}</span>}
                    <div style={{ fontSize: '0.65rem', opacity: 0.65, marginTop: '3px', textAlign: 'right' }}>
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              );
            })}
            {otherTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '8px 14px', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {activeRoom.name} is typing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx,.txt,.zip,.pptx,.xlsx" />
            <button onClick={() => fileRef.current?.click()} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '9px 12px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', flexShrink: 0 }}>📎</button>
            <textarea className="input-field" placeholder="Type a message..." value={input} onChange={handleInputChange}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              style={{ flex: 1, resize: 'none', minHeight: '42px', maxHeight: '120px', lineHeight: 1.5 }} rows={1} />
            <button className="btn-primary" onClick={() => sendMessage(input)} style={{ padding: '10px 18px', flexShrink: 0 }}>Send</button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>Select a conversation</div>
          <div style={{ fontSize: '0.85rem' }}>or find a new study partner to chat with</div>
          <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/matching')}>Find Partners</button>
        </div>
      )}

      {inCall && <VideoCall peer={callPeer} callType={callType} onEnd={() => setInCall(false)} />}
    </div>
  );
}
