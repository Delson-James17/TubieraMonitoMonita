import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

import AuthPage from "./pages/AuthPage";
import CreateEventPage from "./pages/CreateEventPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import EventPage from "./pages/EventPage";
import RevealPage from "./pages/RevealPage";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/AppHeader";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          {/* ✅ Redirect root to login */}
          <Route path="/" element={<Navigate to="/auth" replace />} />

          <Route path="/auth" element={<AuthPage />} />

          {/* Optional: protect create-event page later */}
          <Route path="/create" element={<CreateEventPage />} />

          <Route path="/event/:id" element={<EventPage />} />
          <Route path="/reveal/:eventId/:name" element={<RevealPage />} />

          {/* 🔒 Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
