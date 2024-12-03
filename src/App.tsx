import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import WelcomePage from "./components/WelcomePage";
import "./index.css";
import LoginPage from "./components/Login";
import SignupPage from "./components/SignupPage";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PharmacyStockUpdate from "./components/StockUpdate";
import Billing from "./components/Billing";
import Appointment from "./components/Appointment";
import History from "./components/History";
import Patients from "./components/Patients";

// Custom festival backgrounds
const festivalBackgrounds = {
  diwali: "https://example.com/diwali-bg.jpg",
  christmas: "https://example.com/christmas-bg.jpg",
  eid: "https://example.com/eid-bg.jpg",
  default: "https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg",
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster />
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const ProtectedRoutes: React.FC = () => {
  const { isLoggedIn } = useAuth(); // Safe to call here because it's within AuthProvider
  const role = localStorage.getItem("role"); // Retrieve the role from localStorage
  const currentFestival = "default"; // Replace with dynamic logic as needed

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <WelcomePage
            bgImage={
              festivalBackgrounds[currentFestival] || festivalBackgrounds.default
            }
          />
        }
      />
      {role === "Doctor" && <Route path="/appointment" element={<Appointment />} />}
      {role === "Pharmacist" && (
        <>
          <Route path="/stockadd" element={<PharmacyStockUpdate />} />
          <Route path="/billing" element={<Billing />} />
        </>
      )}
      <Route path="/history" element={<History />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
