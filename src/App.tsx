import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import WelcomePage from "./components/WelcomePage";
import "./index.css";
import LoginPage from "./components/Login";
import SignupPage from "./components/SignupPage";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import StockAdd from "./components/StockAdd";
import Appointment from "./components/Appointment";
import History from "./components/History";
import Patients from "./components/Patients";
import StockManager from "./components/StockManager";
import BillingParent from "./components/BillingParent";
import MedicineManager from "./components/MedicineManager";

// Festival backgrounds
const festivalBackgrounds = {
  diwali: "https://example.com/diwali-bg.jpg",
  christmas: "https://example.com/christmas-bg.jpg",
  eid: "https://example.com/eid-bg.jpg",
  default: "https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg",
};

// Protected Route Wrapper
const ProtectedRoutesComponent: React.FC = () => {
  const { isLoggedIn } = useAuth();
  // const role = localStorage.getItem("role") || "";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Navbar />
      <div>
        <Outlet /> {/* Renders child routes */}
      </div>
    </div>
  );
};

const WelcomeWithBackground = () => {
  const currentFestival = "default";
  return (
    <WelcomePage
      bgImage={
        festivalBackgrounds[currentFestival] || festivalBackgrounds.default
      }
    />
  );
};

// Router Setup
const router = createBrowserRouter(
  [
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/signup",
      element: <SignupPage />,
    },
    {
      path: "/*",
      element: <ProtectedRoutesComponent />,
      children: [
        { index: true, element: <WelcomeWithBackground /> }, // Default route
        { path: "appointment", element: <Appointment /> },
        { path: "history", element: <History /> },
        { path: "patients", element: <Patients /> },
        { path: "stockadd", element: <StockAdd /> },
        { path: "stockmanager", element: <StockManager /> },
        { path: "billing", element: <BillingParent /> },
        { path: "medmanager", element: <MedicineManager /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster />
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
