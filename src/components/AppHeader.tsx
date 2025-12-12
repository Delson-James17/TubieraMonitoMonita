import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login"); // 👈 redirect after logout
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: 24,
        right: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 50,
      }}
    >
      {/* LEFT */}
      <button
        onClick={() => navigate("/admin")}
        style={{
          background: "transparent",
          border: "none",
          color: "#9fb7ff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        🎄 Admin Dashboard
      </button>

      {/* RIGHT */}
      <button
        onClick={handleLogout}
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white",
          padding: "6px 14px",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
