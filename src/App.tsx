import { BrowserRouter, Routes, Route } from "react-router-dom";
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
        {/* Global Navbar */}
        <Navbar />

        {/* Pages */}
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<CreateEventPage />} />
          <Route path="/event/:id" element={<EventPage />} />
          <Route path="/reveal/:eventId/:name" element={<RevealPage />} />

          {/* 🔒 Protected Admin */}
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
