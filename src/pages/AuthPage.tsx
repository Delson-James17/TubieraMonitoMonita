import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

/** ❄ Generate snowflakes ONCE */
const generateSnowflakes = () =>
  [...Array(30)].map(() => ({
    left: `${Math.random() * 100}%`,
    duration: `${6 + Math.random() * 8}s`,
    delay: `${Math.random() * 6}s`,
    size: `${12 + Math.random() * 18}px`,
  }));

export default function AuthPage() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  const [snowflakes] = useState(generateSnowflakes);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 🔐 Redirect logged-in users away from login page
  useEffect(() => {
    if (user) {
      navigate("/create", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/create", { replace: true });
      } else {
        await register(email, password);
        setShowConfirmModal(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

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

      {/* 🎄 Auth Card */}
      <div className="auth-box">
        <p className="eyebrow">Monito Monita · Share the joy</p>
        <h2 className="auth-title">
          {mode === "login" ? "Welcome Back 🎄" : "Join Secret Santa 🎁"}
        </h2>

        <p className="intro">A thoughtful gift starts with a little mystery. Plan your next gift exchange in minutes.</p>
        {error && <p className="auth-error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={mode === "register" ? 6 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="button" className="auth-switch" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide password" : "Show password"}</button>

          <button type="submit" className="auth-button" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in →" : "Create account →"}
          </button>
        </form>

        <button
          className="auth-switch"
          disabled={busy}
          onClick={() =>
            setMode(mode === "login" ? "register" : "login")
          }
        >
          {mode === "login"
            ? "No account yet? Register instead"
            : "Already registered? Login here"}
        </button>
      </div>

      {/* ✅ CONFIRM EMAIL MODAL */}
      {showConfirmModal && (
        <div className="confirm-overlay">
          <div className="confirm-modal" role="dialog" aria-modal="true" aria-label="Confirm your email">
            <h3>📩 Confirm your email</h3>
            <p>
              We’ve sent a confirmation link to <b>{email}</b>.
              <br />
              Please verify your email before logging in.
            </p>

            <button
              className="auth-button"
              onClick={() => {
                setShowConfirmModal(false);
                setMode("login");
              }}
            >
              OK, Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
