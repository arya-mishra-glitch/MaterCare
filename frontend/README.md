# MaterCare Frontend — Updated Files

## What Changed & Why

### 1. `src/api.js` ← NEW FILE (most important)
A shared Axios instance that:
- Automatically attaches `Authorization: Bearer <token>` to **every** request
- Redirects to `/` and clears localStorage if a 401 (expired/invalid token) is received
- All components import this instead of raw `axios`

### 2. `src/App.js`
- Added `<PrivateRoute>` — wraps `/dashboard` so unauthenticated users are redirected to `/`
- No token in localStorage → can't access dashboard

### 3. `src/pages/MaterCareLogin.jsx`
- Changed API URL to `/api/auth/login` (matches new backend routes)
- After successful login: stores `token` and `user` in `localStorage`
- No more `alert("Login successful")` — just navigates directly

### 4. `src/pages/Dashboard.jsx`
- Fetches **pregnancy week** from `GET /api/pregnancy/week`
- Fetches **Tests / Medications / Vaccinations counts** from real health endpoints
- Shows dynamic trimester label and baby size based on week
- Shows upcoming appointments list on dashboard home
- User initials derived from stored user name
- Logout button clears localStorage and redirects to login

### 5. `src/pages/Appointments.jsx`
- Doctor field is now a **dropdown** (fetched from `GET /api/doctors`)
- Hospital is **auto-filled** when a doctor is selected (no manual ID entry)
- Date picker loads **available time slots** from `GET /api/doctors/:id/availability?date=`
- All API calls use `api.js` (JWT attached automatically)
- Better UI: date box card layout, edit/delete styled buttons, empty state

---

## How to Integrate

1. Copy all files into your existing project, matching the paths:
   ```
   src/
   ├── api.js                    ← NEW
   ├── App.js                    ← REPLACE
   └── pages/
       ├── MaterCareLogin.jsx    ← REPLACE
       ├── Dashboard.jsx         ← REPLACE
       └── Appointments.jsx      ← REPLACE
   ```

2. Keep your existing `MaterCareLogin.css` — it's unchanged.

3. Make sure these backend endpoints exist (from the rewritten backend):
   - `POST /api/auth/login`             → returns `{ token, user }`
   - `GET  /api/appointments`           → list (JWT protected)
   - `POST /api/appointments`           → create (JWT protected)
   - `PUT  /api/appointments/:id`       → update (JWT protected)
   - `DELETE /api/appointments/:id`     → delete (JWT protected)
   - `GET  /api/pregnancy/week`         → returns `{ week, start_date }`
   - `GET  /api/doctors`                → returns `[{ doctor_id, name, specialization, hospital_id, hospital_name }]`
   - `GET  /api/doctors/:id/availability?date=YYYY-MM-DD` → available slots
   - `GET  /api/health/tests`
   - `GET  /api/health/medications`
   - `GET  /api/health/vaccinations`
