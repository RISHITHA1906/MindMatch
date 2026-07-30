import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Matching from './pages/Matching';
import SkillBarter from './pages/SkillBarter';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Sessions from './pages/Sessions';
import Mentors from './pages/Mentors';
import Analytics from './pages/Analytics';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: '2.5rem' }}>🧠</div>
      <div style={{ color: 'var(--text-muted)' }}>Loading MindMatch...</div>
    </div>
  );
  if (!user) return <Navigate to="/landing" replace state={{ from: location }} />;
  return children;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: '0.88rem' },
        success: { duration: 3000 }, error: { duration: 4500 },
      }} />
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/login"   element={<GuestOnly><Login /></GuestOnly>} />
        {/* /register is INTENTIONALLY unwrapped — Register manages its own flow */}
        <Route path="/register" element={<Register />} />

        <Route path="/" element={
          <PrivateRoute>
            <SocketProvider><Layout /></SocketProvider>
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="matching"          element={<Matching />} />
          <Route path="barter"            element={<SkillBarter />} />
          <Route path="chat"              element={<Chat />} />
          <Route path="chat/:userId"      element={<Chat />} />
          <Route path="profile"           element={<Profile />} />
          <Route path="profile/:userId"   element={<Profile />} />
          <Route path="sessions"          element={<Sessions />} />
          <Route path="mentors"           element={<Mentors />} />
          <Route path="analytics"         element={<Analytics />} />
        </Route>
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
