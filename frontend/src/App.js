import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import MaterCareLogin from "./pages/MaterCareLogin";
import MaterCareSignup from "./pages/MaterCareSignup";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Symptoms from "./pages/Symptoms";
import Tests from "./pages/Tests";
import Medication from "./pages/Medication";
import Vaccination from "./pages/Vaccination";
import Documents from "./pages/Documents";
import Reminders from "./pages/Reminders";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import AddBaby from "./pages/AddBaby";
import BabyProfile from "./pages/BabyProfile";
import NotFound from "./pages/NotFound";
import SidebarLayout from "./components/SidebarLayout";
import { useEffect, useState } from "react";
import api from "./api";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const [pregnancyChecked, setPregnancyChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (token) {
      api.get("/pregnancy/status")
        .then((res) => {
          if (res.data.phase === "onboarding") {
            setNeedsOnboarding(true);
          } else {
            setNeedsOnboarding(false);
          }
        })
        .catch(() => {
          // Fallback or error handling
          setNeedsOnboarding(false); 
        })
        .finally(() => setPregnancyChecked(true));
    } else {
      setPregnancyChecked(true);
    }
  }, [token]);

  if (!token) return <Navigate to="/" state={{ from: location }} replace />;
  if (!pregnancyChecked) return <div style={{height:"100vh", display:"flex", alignItems:"center", justifyContent:"center"}}>Loading...</div>;
  if (needsOnboarding && location.pathname !== "/onboard") return <Navigate to="/onboard" replace />;
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MaterCareLogin />} />
        <Route path="/login" element={<MaterCareLogin />} />
        <Route path="/register" element={<MaterCareSignup />} />
        
        <Route path="/onboard" element={<PrivateRoute><Onboarding /></PrivateRoute>} />

        <Route element={<PrivateRoute><SidebarLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/symptoms" element={<Symptoms />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/medication" element={<Medication />} />
          <Route path="/vaccination" element={<Vaccination />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/baby" element={<BabyProfile />} />
          <Route path="/baby/add" element={<AddBaby />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
