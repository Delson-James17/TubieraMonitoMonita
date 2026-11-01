import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/useAuth';
import { generateDerangement } from '../utils/derangement';
interface GiftEvent { id: string; title: string; created_at: string; expires_at: string | null }
interface Participant { id: string; name: string; assigned_to: string | null }
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<GiftEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true;
    if (!user) return;
    void supabase.from('events').select('id,title,created_at,expires_at').eq('created_by', user.id).order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!active) return;
      if (error) setError('Could not load your events. Refresh to try again.');
      else { setEvents(data ?? []); setSelectedEventId(data?.[0]?.id ?? ''); }
      setLoadingEvents(false);
    }); return () => { active = false; };
  }, [user]);
  useEffect(() => {
    let active = true;
    if (!selectedEventId) return;
    void supabase.from('participants').select('id,name,assigned_to').eq('event_id', selectedEventId).order('name').then(({ data, error }) => {
      if (!active) return;
      if (error) setError('Could not load participants. Select the event again to retry.');
      else setParticipants(data ?? []);
      setLoadingPeople(false);
    }); return () => { active = false; };
  }, [selectedEventId]);
  const selected = events.find(e => e.id === selectedEventId);
  const expired = !!selected?.expires_at && new Date(selected.expires_at).getTime() <= Date.now();
  const hasDraw = participants.some(p => p.assigned_to);
  const runDraw = async () => {
    if (busy || loadingPeople || participants.length < 2 || expired) return;
    if (hasDraw && !window.confirm('Run a new draw? This will change existing recipients, including those already revealed.')) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const assignments = generateDerangement(participants.map(p => p.name));
      for (let i = 0; i < participants.length; i++) {
        const { data, error } = await supabase.from('participants').update({ assigned_to: assignments[i] }).eq('id', participants[i].id).eq('event_id', selectedEventId).select('id');
        if (error || !data?.length) throw new Error('Draw could not be completed. Some assignments may have changed. Run the draw again before sharing results.');
      }
      setParticipants(participants.map((p, i) => ({ ...p, assigned_to: assignments[i] })));
      setNotice('Draw complete! Everyone has a recipient. You can now share your event.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not complete the draw. Please try again.'); }
    finally { setBusy(false); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/event/${selectedEventId}`); setNotice('Invite link copied!'); }
    catch { setError('Copy is unavailable. Open the event and copy its address.'); }
  };
  return <main className="auth-root"><section className="auth-box" style={{ maxWidth: 1040 }}><p className="eyebrow">The joy starts here</p><h1 className="auth-title">Your gift exchanges</h1><p className="intro">Manage your people, make the draw, and share a little magic.</p>
    {error && <p className="auth-error" role="alert">{error}</p>}{notice && <p className="notice" role="status">{notice}</p>}
    <div className="dashboard-grid"><aside><div className="actions"><Link className="button" to="/create">+ New exchange</Link></div>{loadingEvents ? <p role="status">Loading events…</p> : events.length === 0 ? <p className="empty">Your first exchange is waiting to happen.</p> : <div className="participant-list">{events.map(e => <button className={`auth-button ${selectedEventId === e.id ? '' : 'secondary'}`} style={{ textAlign: 'left', flexDirection: 'column', alignItems: 'flex-start' }} key={e.id} disabled={busy} aria-pressed={selectedEventId === e.id} onClick={() => { if (selectedEventId === e.id) return; setLoadingPeople(true); setParticipants([]); setSelectedEventId(e.id); setError(''); setNotice(''); }}><span>{e.title}</span><small>{new Date(e.created_at).toLocaleDateString()} · {e.expires_at && new Date(e.expires_at).getTime() <= Date.now() ? 'Expired' : 'Open'}</small></button>)}</div>}</aside>
    <div>{selected ? <><h2>{selected.title}</h2><p className="helper">{participants.length} participants · {expired ? 'Event expired' : hasDraw ? 'Assignments available' : 'Ready for a draw'}</p><div className="actions"><button className="auth-button" onClick={runDraw} disabled={busy || loadingPeople || participants.length < 2 || expired}>{busy ? 'Drawing…' : hasDraw ? 'Re-draw names' : 'Run the draw'}</button><button className="auth-button secondary" disabled={busy} onClick={copy}>Copy invite</button><Link className="button secondary" to={`/event/${selectedEventId}`}>Open event</Link></div><p className="helper" style={{ marginBottom: 16 }}>Organizer view: assignments are visible below.</p>{loadingPeople ? <p role="status">Loading participants…</p> : <div className="participant-list">{participants.map(p => <div className="participant-row" key={p.id}><span>{p.name}</span><strong>{p.assigned_to ?? 'Not drawn'}</strong></div>)}{participants.length === 0 && <p className="empty">No participants in this event.</p>}</div>}</> : <p className="empty">Create an exchange to get started.</p>}</div></div>
  </section></main>;
}
