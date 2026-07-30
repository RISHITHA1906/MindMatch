import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

export default function VideoCall({ peer, callType, onEnd, isIncoming, incomingOffer, callerId }) {
  const { user } = useAuth();
  const { emit, on, off } = useSocket();
  const localRef = useRef();
  const remoteRef = useRef();
  const pcRef = useRef();
  const localStream = useRef();
  const [status, setStatus] = useState(isIncoming ? 'incoming' : 'calling');
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(callType === 'audio');
  const [duration, setDuration] = useState(0);
  const timerRef = useRef();

  const cleanup = useCallback(() => {
    clearInterval(timerRef.current);
    localStream.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
  }, []);

  const initPC = useCallback(async () => {
    // STUN: helps peers find their public IP (free, works for ~70% of connections)
    // TURN: relays media when peers are behind strict NAT/firewalls (needed for hosted production)
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
      ],
    };
    const pc = new RTCPeerConnection(config);
    pcRef.current = pc;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video', audio: true
      });
      localStream.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
    } catch (err) {
      toast.error('Camera/mic access denied. Check browser permissions.');
    }

    pc.ontrack = (e) => {
      if (remoteRef.current) remoteRef.current.srcObject = e.streams[0];
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        emit('call_ice_candidate', { to: peer?.id || callerId, from: user.id, candidate: e.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setStatus('connected');
        timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      }
    };

    return pc;
  }, [callType, peer, callerId, user, emit]);

  useEffect(() => {
    const startCall = async () => {
      if (isIncoming) return;
      const pc = await initPC();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      emit('call_offer', { to: peer.id, from: user.id, from_name: user.name, offer, call_type: callType });
    };

    const handleAnswer = async ({ answer }) => {
      if (pcRef.current?.signalingState === 'have-local-offer') {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleICE = async ({ candidate }) => {
      try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    };

    const handleEnd = () => { cleanup(); onEnd(); toast('Call ended'); };

    startCall();
    on('call_answered', handleAnswer);
    on('ice_candidate', handleICE);
    on('call_ended', handleEnd);

    return () => {
      off('call_answered', handleAnswer);
      off('ice_candidate', handleICE);
      off('call_ended', handleEnd);
      cleanup();
    };
  }, []);

  const acceptCall = async () => {
    setStatus('connected');
    const pc = await initPC();
    await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    emit('call_answer', { to: callerId, from: user.id, answer });
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
  };

  const endCall = () => {
    emit('end_call', { to: peer?.id || callerId, from: user.id });
    cleanup();
    onEnd();
  };

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const toggleMute = () => {
    localStream.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMuted(m => !m);
  };

  const toggleVideo = () => {
    localStream.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setVideoOff(v => !v);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(12,6,20,0.97)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center'
    }}>
      {/* Remote video */}
      <video ref={remoteRef} autoPlay playsInline style={{
        width: '100%', maxWidth: '800px', maxHeight: '60vh',
        borderRadius: 'var(--radius-lg)', objectFit: 'cover',
        background: '#1a1a2e', display: status === 'connected' ? 'block' : 'none'
      }} />

      {status !== 'connected' && (
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '24px' }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 16px', animation: 'pulse 1.5s ease infinite' }}>
            {peer?.name?.[0] || callerId?.[0] || '?'}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{peer?.name || 'Caller'}</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
            {status === 'calling' ? 'Calling...' : isIncoming ? `Incoming ${callType} call` : 'Connecting...'}
          </div>
        </div>
      )}

      {status === 'connected' && (
        <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: '10px', fontSize: '0.9rem' }}>
          {peer?.name} · {fmt(duration)}
        </div>
      )}

      {/* Local video pip */}
      {callType === 'video' && (
        <video ref={localRef} autoPlay playsInline muted style={{
          position: 'absolute', bottom: '100px', right: '20px',
          width: '140px', height: '100px', borderRadius: 'var(--radius-md)',
          objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)', background: '#333'
        }} />
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', alignItems: 'center' }}>
        {isIncoming && status === 'incoming' && (
          <button onClick={acceptCall} style={{ width: 58, height: 58, borderRadius: '50%', background: '#22c55e', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>📞</button>
        )}
        <button onClick={toggleMute} style={{ width: 50, height: 50, borderRadius: '50%', background: muted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '1.2rem', cursor: 'pointer' }}>{muted ? '🔇' : '🎙️'}</button>
        {callType === 'video' && <button onClick={toggleVideo} style={{ width: 50, height: 50, borderRadius: '50%', background: videoOff ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '1.2rem', cursor: 'pointer' }}>{videoOff ? '📵' : '📹'}</button>}
        <button onClick={endCall} style={{ width: 58, height: 58, borderRadius: '50%', background: '#ef4444', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>📵</button>
      </div>

      <style>{`@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(232,122,170,0.5); } 50% { box-shadow: 0 0 0 20px rgba(232,122,170,0); } }`}</style>
    </div>
  );
}
