# 🎄 Secret Santa Draw App

A modern **Secret Santa web application** built with **React, TypeScript, Supabase, and Bootstrap**.  
It allows admins to create Secret Santa events, share them via link or QR code, and lets participants reveal their assigned recipient — **without needing an account**.

---

## ✨ Features

### 👤 Admin Features
- 🔐 Secure login & registration (Supabase Auth)
- 🎁 Create Secret Santa events
- 👥 Add participants
- 🔄 Run a **perfect derangement draw** (no self-picks, no duplicates)
- 📊 Admin dashboard to view results
- ⏳ Event expiration support
- 🚪 Logout

### 🎅 Participant Features (No Login Required)
- 🔗 Join via **shareable link**
- 📸 Join via **QR Code**
- 👆 Select your name from the list
- 🎉 Reveal your Secret Santa recipient
- ❄️ Clean, distraction-free UI (no navbar)

### 🎨 UI & UX
- Christmas-themed design 🎄
- Responsive (mobile & desktop)
- Minimal layout for participants
- Admin-only navigation
- Glassmorphism cards & festive styling

---

## 🧠 Key Concepts Used

- **Perfect Derangement Algorithm**
  - Ensures:
    - No participant draws themselves
    - No duplicate assignments
- **Route-based Layouts**
  - Admin layout (with header)
  - Public layout (no navbar)
- **Strict TypeScript + ESLint**
- **Supabase Backend**
  - Auth
  - Database
  - Row-based filtering

---

## 🏗️ Tech Stack

| Layer | Technology |
|-----|-----------|
Frontend | React + TypeScript |
Routing | React Router v6 |
Styling | Bootstrap 5 |
Backend | Supabase |
Auth | Supabase Auth |
Database | PostgreSQL (Supabase) |
Deployment | Vercel / Netlify |

---

## 📁 Project Structure

src/
├─ components/
│ └─ AdminRoute.tsx
├─ context/
│ ├─ AuthContext.ts
│ ├─ AuthProvider.tsx
│ └─ useAuth.ts
├─ lib/
│ └─ supabaseClient.ts
├─ pages/
│ ├─ AuthPage.tsx
│ ├─ CreateEventPage.tsx
│ ├─ AdminDashboardPage.tsx
│ ├─ EventPage.tsx
│ └─ RevealPage.tsx
├─ utils/
│ └─ derangement.ts
├─ App.tsx
└─ main.tsx

---

## 🔐 Authentication Flow

- **Admins**
  - Must log in to create and manage events
- **Participants**
  - No login required
  - Access events via public links

---

## 🔄 Draw Logic (Perfect Shuffle)

The app uses a **derangement algorithm** to ensure fairness:

Delson → Hazel
Hazel → James
James → Aira
Aira → Delson

Rules:
- ❌ No self-assignment
- ❌ No duplicate receivers
- ✅ Everyone gets exactly one person

---

## 🔗 Routes Overview

| Route | Description |
|-----|------------|
`/` | Create event (admin) |
`/auth` | Login / Register |
`/admin` | Admin dashboard |
`/event/:id` | Public participant page |
`/reveal/:eventId/:name` | Reveal Secret Santa |

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

---

## 🗄️ Supabase Tables (Example)

### `events`
- `id`
- `title`
- `created_by`
- `created_at`
- `expires_at`

### `participants`
- `id`
- `event_id`
- `name`
- `assigned_to`

---

## 🔒 Security Notes

- Admin-only write operations
- Public read-only access for events
- Participants can only view their result
- No sensitive data exposed

---

## 📱 Mobile Friendly

- Fully responsive
- Touch-friendly buttons
- Optimized for QR code access

---

## 🌟 Future Enhancements

- 🎊 Confetti & sound effects on reveal
- 📤 Email notifications
- 🎟️ Event password protection
- 📆 Scheduled auto-draw
- 👨‍👩‍👧‍👦 Group limits

---

## 👨‍💻 Author

**Delson James Tubiera**  
Full-Stack Developer  
React • TypeScript • Supabase • .NET • Node.js

---

## 📜 License

MIT License — free to use, modify, and share.
