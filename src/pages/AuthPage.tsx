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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 🔐 Redirect logged-in users away from login page
  useEffect(() => {
    if (user) {
      navigate("/create", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
        <h2 className="auth-title">
          {mode === "login" ? "Welcome Back 🎄" : "Join Secret Santa 🎁"}
        </h2>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <button
          className="auth-switch"
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
          <div className="confirm-modal">
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
