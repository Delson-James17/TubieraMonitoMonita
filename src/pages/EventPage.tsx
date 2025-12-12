import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

/** ❄ Generate snowflakes ONCE */
const generateSnowflakes = () =>
  [...Array(30)].map(() => ({
    left: `${Math.random() * 100}%`,
    duration: `${6 + Math.random() * 8}s`,
    delay: `${Math.random() * 6}s`,
    size: `${12 + Math.random() * 18}px`,
  }));

interface Event {
  id: string;
  title: string;
  expires_at: string | null;
}

interface Participant {
  id: string;
  name: string;
}

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [snowflakes] = useState(generateSnowflakes);
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const { data: e } = await supabase
        .from("events")
        .select("id,title,expires_at")
        .eq("id", id)
        .single();

      setEvent(e as Event | null);

      const { data: p } = await supabase
        .from("participants")
        .select("id,name")
        .eq("event_id", id)
        .order("name", { ascending: true });

      setParticipants((p as Participant[]) ?? []);
    };

    load();
  }, [id]);

  if (!event) {
    return (
      <div className="auth-root">
        <div className="auth-box text-center">
          <p className="text-white">Loading event…</p>
        </div>
      </div>
    );
  }

  const expired =
    event.expires_at !== null &&
    new Date(event.expires_at) < new Date();

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

      {/* 🎁 Event Card */}
      <div className="auth-box">
        <h2 className="auth-title">🎁 {event.title}</h2>

        {expired ? (
          <p className="text-center text-white-50">
            This event has expired 🎄
          </p>
        ) : (
          <>
            <p className="text-center text-white-50 mb-4">
              Select your name to reveal your Secret Santa 🎅
            </p>

            <div className="auth-form">
              {participants.map((p) => (
                <button
                  key={p.id}
                  className="auth-button"
                  style={{
                    background:
                      "rgba(255,255,255,0.08)",
                    boxShadow:
                      "0 8px 20px rgba(0,0,0,0.35)",
                    border:
                      "1px solid rgba(255,255,255,0.2)",
                  }}
                  onClick={() =>
                    navigate(
                      `/reveal/${event.id}/${encodeURIComponent(
                        p.name
                      )}`
                    )
                  }
                >
                  🎄 {p.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
