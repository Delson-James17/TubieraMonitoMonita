import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
interface GiftEvent { id: string; title: string; expires_at: string | null }
interface Participant { id: string; name: string }
export default function EventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<GiftEvent | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const { data, error: eventError } = await supabase.from('events').select('id,title,expires_at').eq('id', id).single();
        if (eventError || !data) throw new Error('This invitation is unavailable. Check the link with your organizer.');
        const { data: people, error: peopleError } = await supabase.from('participants').select('id,name').eq('event_id', id).order('name');
        if (peopleError) throw new Error('Could not load participants. Please refresh to try again.');
        if (active) { setEvent(data); setParticipants(people ?? []); }
      } catch (err) { if (active) setError(err instanceof Error ? err.message : 'Could not load event.'); }
      finally { if (active) setLoading(false); }
    }; void load(); return () => { active = false; };
  }, [id]);
  const expired = event?.expires_at && new Date(event.expires_at).getTime() <= Date.now();
  const filtered = participants.filter(p => p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  return <main className="auth-root"><section className="auth-box"><p className="eyebrow">You’re invited</p><h1 className="auth-title">{event?.title ?? 'Monito Monita'}</h1>
    {loading ? <p role="status">Loading your exchange…</p> : error ? <p className="auth-error" role="alert">{error}</p> : expired ? <p className="notice">This event has expired. Contact your organizer.</p> : <><p>Select your own name to discover who you’re giving a gift to.</p><div className="auth-field"><label htmlFor="search">Find your name</label><input id="search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search participants…" /></div><p className="helper" style={{ margin: '16px 0' }}>{participants.length} people sharing the joy</p><div className="participant-list">{filtered.map(p => <Link className="button secondary" key={p.id} to={`/reveal/${event!.id}/${encodeURIComponent(p.name)}`}>{p.name} <span aria-hidden="true">→</span></Link>)}</div>{filtered.length === 0 && <p className="empty">{participants.length ? 'No matching names. Try another search.' : 'No participants have been added yet.'}</p>}<p className="helper" style={{ marginTop: 24 }}>Keep the surprise alive. Only open your own name.</p></>}
  </section></main>;
}
