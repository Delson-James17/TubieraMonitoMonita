import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
export default function RevealPage() {
  const { eventId, name } = useParams();
  const [loading, setLoading] = useState(true);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setRevealed(false); setError(''); setAssignedTo(null);
    const load = async () => {
      try {
        const { data: event, error: eventError } = await supabase.from('events').select('expires_at').eq('id', eventId).single();
        if (eventError || !event) throw new Error('This event is unavailable. Check with your organizer.');
        if (event.expires_at && new Date(event.expires_at).getTime() <= Date.now()) throw new Error('This event has expired. Contact your organizer.');
        const { data, error: personError } = await supabase.from('participants').select('assigned_to').eq('event_id', eventId).eq('name', name).single();
        if (personError || !data) throw new Error('Your name could not be found. Return to the event and select it again.');
        if (active) setAssignedTo(data.assigned_to);
      } catch (err) { if (active) setError(err instanceof Error ? err.message : 'Could not load your draw.'); }
      finally { if (active) setLoading(false); }
    }; void load(); return () => { active = false; };
  }, [eventId, name]);
  return <main className="auth-root"><section className="auth-box text-center"><p className="eyebrow">A surprise just for you</p><h1 className="auth-title">Hello, {name} 🎁</h1>
    {loading ? <p role="status">Preparing your surprise…</p> : error ? <p className="auth-error" role="alert">{error}</p> : !assignedTo ? <p className="notice">Your organizer hasn’t completed the draw yet. Come back soon!</p> : <><p>{revealed ? 'You’re giving a gift to…' : 'Ready to discover your gift recipient? Make sure nobody is peeking.'}</p><div className="empty" aria-live="polite" style={{ margin: '24px 0' }}>{revealed ? <h2 style={{ color: '#ead194' }}>{assignedTo}</h2> : <span style={{ fontSize: 56 }} aria-hidden="true">🎁</span>}</div><button className="auth-button" onClick={() => setRevealed(!revealed)}>{revealed ? 'Hide my recipient' : 'Reveal my recipient'}</button>{revealed && <p className="helper" style={{ marginTop: 20 }}>Keep it a secret, and make their day.</p>}</>}
    <p><Link to={`/event/${eventId}`}>← Back to the exchange</Link></p>
  </section></main>;
}
