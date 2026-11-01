import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!user) return null;
  const handleLogout = async () => {
    setBusy(true); setError('');
    try { await logout(); navigate('/auth', { replace: true }); }
    catch { setError('Sign out failed. Please try again.'); }
    finally { setBusy(false); }
  };
  return <header className="app-header"><Link className="brand" to="/create">🎁 Monito Monita</Link><nav aria-label="Main navigation"><NavLink to="/create">Create event</NavLink><NavLink to="/admin">My events</NavLink><button disabled={busy} onClick={handleLogout}>{busy ? 'Signing out…' : 'Sign out'}</button></nav>{error && <span role="alert">{error}</span>}</header>;
}
