import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/useAuth';

export default function CreateEventPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [names, setNames] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [eventLink, setEventLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const participantList = names.split('\n').map(n => n.trim()).filter(Boolean);
  const createEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;
    setError('');
    if (participantList.length < 2) return setError('Add at least two participants.');
    if (new Set(participantList.map(n => n.toLocaleLowerCase())).size !== participantList.length) return setError('Each participant needs a unique name. Add a surname or initial for names that repeat.');
    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) return setError('Choose an expiration date in the future.');
    setLoading(true);
    try {
      const { data: event, error: eventError } = await supabase.from('events').insert({ title: title.trim(), created_by: user.id, expires_at: expiresAt ? new Date(expiresAt).toISOString() : null }).select('id').single();
      if (eventError) throw eventError;
      const { error: participantsError } = await supabase.from('participants').insert(participantList.map(name => ({ event_id: event.id, name })));
      if (participantsError) {
        const { error: cleanupError } = await supabase.from('events').delete().eq('id', event.id);
        if (cleanupError) throw new Error('Participants could not be saved. An empty event remains in My events.');
        throw participantsError;
      }
      setEventLink(`${window.location.origin}/event/${event.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not create your event. Please try again.'); }
    finally { setLoading(false); }
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(eventLink); setNotice('Event link copied!'); }
    catch { setNotice('Copy is unavailable. Select and copy the link below.'); }
  };
  return <main className="auth-root"><section className="auth-box" style={{ maxWidth: 620 }}>
    <p className="eyebrow">A little mystery. A lot of joy.</p>
    <h1 className="auth-title">Bring your people together 🎁</h1>
    <p className="intro">Create a Monito Monita exchange, invite your group, and let the surprises begin.</p>
    {error && <p className="auth-error" role="alert">{error}</p>}
    {!eventLink ? <form className="auth-form" onSubmit={createEvent}>
      <div className="auth-field"><label htmlFor="title">What’s the occasion?</label><input id="title" required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="The Tubiera family gift exchange" /></div>
      <div className="auth-field"><label htmlFor="expires">Link expiration <span className="helper">(optional)</span></label><input id="expires" type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} /><p className="helper">Uses your local time. Leave empty to keep the event open.</p></div>
      <div className="auth-field"><label htmlFor="names">Who’s joining? <span className="badge">{participantList.length} participants</span></label><textarea id="names" required rows={6} value={names} onChange={e => setNames(e.target.value)} placeholder={'Delson\nJames\nHazel\nAira'} aria-describedby="names-help" /><p id="names-help" className="helper">One unique name per line. You’ll run the draw from My events.</p></div>
      <button className="auth-button" disabled={loading}>{loading ? 'Creating your event…' : 'Create gift exchange →'}</button>
    </form> : <div><p className="notice" role="status">Your exchange is ready! Run the draw in My events before participants reveal their recipients.</p><div className="qr"><QRCodeCanvas value={eventLink} size={180} marginSize={2} title="Scan to open the event" /></div><p><a href={eventLink}>{eventLink}</a></p><div className="actions"><button className="auth-button" onClick={copyLink}>Copy invite link</button><Link className="button secondary" to="/admin">Go to My events</Link></div><p role="status">{notice}</p><button className="auth-switch" onClick={() => { setEventLink(''); setNotice(''); setTitle(''); setNames(''); setExpiresAt(''); }}>Create another exchange</button></div>}
  </section></main>;
}
