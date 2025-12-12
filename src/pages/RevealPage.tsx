import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

/** ❄ Generate snowflakes ONCE */
const generateSnowflakes = () =>
  [...Array(30)].map(() => ({
    left: `${Math.random() * 100}%`,
    duration: `${6 + Math.random() * 8}s`,
    delay: `${Math.random() * 6}s`,
    size: `${12 + Math.random() * 18}px`,
  }));

export default function RevealPage() {
  const { eventId, name } = useParams();

  const [snowflakes] = useState(generateSnowflakes);
  const [loading, setLoading] = useState(true);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [offset, setOffset] = useState(0);

  // ===============================
  // LOAD DATA
  // ===============================
  useEffect(() => {
    if (!eventId || !name) return;

    const load = async () => {
      const { data: me } = await supabase
        .from("participants")
        .select("assigned_to")
        .eq("event_id", eventId)
        .eq("name", name)
        .single();

      const { data: all } = await supabase
        .from("participants")
        .select("name")
        .eq("event_id", eventId);

      setAssignedTo(me?.assigned_to ?? null);
      setNames(all?.map((p) => p.name) ?? []);
      setLoading(false);
    };

    load();
  }, [eventId, name]);

  // ===============================
  // START ROULETTE
  // ===============================
  const startRoulette = () => {
    if (!assignedTo) return;

    setSpinning(true);

    const index = names.indexOf(assignedTo);
    const itemHeight = 48;
    const spins = 6;

    setOffset(spins * names.length * itemHeight + index * itemHeight);

    setTimeout(() => {
      setSpinning(false);
    }, 4200);
  };

  // ===============================
  // UI
  // ===============================
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

      {/* 🎁 Reveal Card */}
      <div className="auth-box text-center">
        {loading && (
          <p className="text-white">Preparing your draw… 🎄</p>
        )}

        {!loading && !assignedTo && (
          <>
            <h2 className="auth-title">Hello {name} 🎅</h2>
            <p className="text-white-50">
              The admin hasn’t run the draw yet.
            </p>
          </>
        )}

        {!loading && assignedTo && (
          <>
            <h2 className="auth-title mb-4">
              🎁 My Drawn Name
            </h2>

            {/* 🎰 ROULETTE */}
            <div
              style={{
                height: 48,
                overflow: "hidden",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(0,0,0,0.35)",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  transform: `translateY(-${offset}px)`,
                  transition: spinning
                    ? "transform 4s cubic-bezier(0.1, 0.6, 0.1, 1)"
                    : "none",
                }}
              >
                {[...Array(8)].flatMap(() =>
                  names.map((n, i) => (
                    <div
                      key={`${n}-${i}-${Math.random()}`}
                      style={{
                        height: 48,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        fontWeight: 700,
                        color:
                          n === assignedTo && !spinning
                            ? "#facc15"
                            : "#ffffff",
                      }}
                    >
                      {n}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 🎯 ACTION */}
            {!spinning && offset === 0 && (
              <button
                className="auth-button"
                onClick={startRoulette}
              >
                🎄 Start Draw
              </button>
            )}

            {!spinning && offset > 0 && (
              <p
                className="mt-3 fw-bold"
                style={{
                  color: "#facc15",
                  animation: "glow 1.2s infinite alternate",
                }}
              >
                🤫 You got {assignedTo}!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
