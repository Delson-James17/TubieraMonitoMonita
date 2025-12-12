import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/useAuth";
import { generateDerangement } from "../utils/derangement";

/** ❄ Generate snowflakes ONCE */
const generateSnowflakes = () =>
  [...Array(25)].map(() => ({
    left: `${Math.random() * 100}%`,
    duration: `${6 + Math.random() * 8}s`,
    delay: `${Math.random() * 6}s`,
    size: `${12 + Math.random() * 18}px`,
  }));

interface Event {
  id: string;
  title: string;
  created_at: string;
  expires_at: string | null;
}

interface Participant {
  id: string;
  name: string;
  assigned_to: string | null;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [snowflakes] = useState(generateSnowflakes);

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  // Load events
  useEffect(() => {
    if (!user) return;

    supabase
      .from("events")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setEvents(data ?? []));
  }, [user]);

  // Load participants
  useEffect(() => {
    if (!selectedEventId) return;
    loadParticipants(selectedEventId);
  }, [selectedEventId]);

  const loadParticipants = async (eventId: string) => {
    const { data } = await supabase
      .from("participants")
      .select("id,name,assigned_to")
      .eq("event_id", eventId)
      .order("name");

    setParticipants((data as Participant[]) ?? []);
  };

  const runDraw = async () => {
    if (!selectedEventId || participants.length < 2) return;

    setLoading(true);

    try {
      const names = participants.map((p) => p.name);
      const assigned = generateDerangement(names);

      for (let i = 0; i < participants.length; i++) {
        await supabase
          .from("participants")
          .update({ assigned_to: assigned[i] })
          .eq("id", participants[i].id);
      }

      await loadParticipants(selectedEventId);
      alert("🎁 Draw completed!");
    } catch (err) {
      alert(
        "Error during draw: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔒 Not logged in
  if (!user) {
    return (
      <div className="auth-root">
        <div className="auth-box text-center">
          <p className="text-white">
            Please log in to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-root">
      {/* ❄ Snowflakes */}
      {snowflakes.map((flake, idx) => (
        <div
          key={idx}
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

      {/* 🎅 Admin Dashboard */}
      <div className="auth-box" style={{ maxWidth: 900 }}>
        <h2 className="auth-title">🎅 Admin Dashboard</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "20px",
          }}
        >
          {/* 📦 EVENTS */}
          <div>
            <h4 className="text-white mb-3">Your Events</h4>

            <div className="d-flex flex-column gap-2">
              {events.map((e) => {
                const expired =
                  e.expires_at &&
                  new Date(e.expires_at) < new Date();

                return (
                  <button
                    key={e.id}
                    className="auth-button"
                    style={{
                      background:
                        selectedEventId === e.id
                          ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
                          : "rgba(0,0,0,0.35)",
                      textAlign: "left",
                    }}
                    onClick={() => setSelectedEventId(e.id)}
                  >
                    <div className="d-flex justify-content-between">
                      <span>{e.title}</span>
                      {expired && <span>⏳</span>}
                    </div>
                    <small className="opacity-75">
                      {new Date(e.created_at).toLocaleDateString()}
                    </small>
                  </button>
                );
              })}

              {events.length === 0 && (
                <p className="text-white-50">
                  No events created yet.
                </p>
              )}
            </div>
          </div>

          {/* 🎁 PARTICIPANTS */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="text-white">Participants</h4>

              <button
                className="auth-button"
                onClick={runDraw}
                disabled={
                  !selectedEventId ||
                  participants.length < 2 ||
                  loading ||
                  participants.every((p) => p.assigned_to)
                }
              >
                {loading ? "Running…" : "Run Perfect Draw 🎁"}
              </button>
            </div>

            {!selectedEventId && (
              <p className="text-white-50">
                Select an event to view participants.
              </p>
            )}

            {selectedEventId && (
              <div className="d-flex flex-column gap-2">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "12px",
                      background: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{p.name}</span>
                    <strong className="text-warning">
                      {p.assigned_to ?? "—"}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
