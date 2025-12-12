import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/useAuth";
import { QRCodeCanvas } from "qrcode.react";

/** ❄ Generate snowflakes ONCE */
const generateSnowflakes = () =>
  [...Array(30)].map(() => ({
    left: `${Math.random() * 100}%`,
    duration: `${6 + Math.random() * 8}s`,
    delay: `${Math.random() * 6}s`,
    size: `${12 + Math.random() * 18}px`,
  }));

export default function CreateEventPage() {
  const { user } = useAuth();

  const [snowflakes] = useState(generateSnowflakes);
  const [title, setTitle] = useState("");
  const [names, setNames] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="auth-root">
        <div className="auth-box text-center">
          <p className="text-white">
            Please log in to create events.
          </p>
        </div>
      </div>
    );
  }

  const createEvent = async () => {
    setError("");

    if (!title.trim()) {
      setError("Event title is required");
      return;
    }

    const participantList = names
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);

    if (participantList.length < 2) {
      setError("At least 2 participants are required");
      return;
    }

    try {
      setLoading(true);

      const { data: event, error } = await supabase
        .from("events")
        .insert({
          title,
          created_by: user.id,
          expires_at: expiresAt || null,
        })
        .select()
        .single();

      if (error) throw error;

      const participants = participantList.map((name) => ({
        event_id: event.id,
        name,
      }));

      const { error: pError } = await supabase
        .from("participants")
        .insert(participants);

      if (pError) throw pError;

      setEventLink(`${window.location.origin}/event/${event.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create event"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ❄ Snowflakes */}
      {snowflakes.map((flake, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            left: flake.left,
            fontSize: flake.size,
            animationDuration: flake.duration,
            animationDelay: flake.delay,
          }}
        >
          ❄
        </div>
      ))}

      {/* 🎁 Create Event Card */}
      <div className="auth-box">
        <h2 className="auth-title">🎁 Create Secret Santa Event</h2>

        {error && <p className="auth-error">{error}</p>}

        {!eventLink && (
          <div className="auth-form">
            <div className="auth-field">
              <label>Event Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Christmas Party 2025"
              />
            </div>

            <div className="auth-field">
              <label>Expiration Date (optional)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label>Participants (one per line)</label>
              <textarea
                rows={5}
                value={names}
                onChange={(e) => setNames(e.target.value)}
                placeholder={`Delson\nJames\nHazel\nAira`}
              />
            </div>

            <button
              className="auth-button"
              onClick={createEvent}
              disabled={loading}
            >
              {loading ? "Creating…" : "🎄 Create Event"}
            </button>
          </div>
        )}

        {eventLink && (
          <div className="text-center">
            <h4 className="mt-2 text-white">🎉 Event Created!</h4>

            <p className="small text-white-50">
              Share this link with participants
            </p>

            <a
              href={eventLink}
              target="_blank"
              rel="noreferrer"
              className="text-info d-block mb-3 text-break"
            >
              {eventLink}
            </a>

            <QRCodeCanvas
              value={eventLink}
              size={180}
              bgColor="#ffffff"
              fgColor="#d90429"
            />

            <p className="small text-white-50 mt-3">
              Scan the QR code to join 🎄
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
