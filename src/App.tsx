import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import WelcomePage from './components/WelcomePage';
import './index.css';
import LoginPage from './components/Login';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import PharmacyStockUpdate from './components/StockUpdate';
import Billing from './components/Billing';
import Appointment from './components/Appointment';
import Component from './components/History';
import Patients from './components/Patients';

// Custom festival backgrounds
const festivalBackgrounds = {
  diwali: 'https://example.com/diwali-bg.jpg',
  christmas: 'https://example.com/christmas-bg.jpg',
  eid: 'https://example.com/eid-bg.jpg',
  default: 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg',
};

const App: React.FC = () => {
  const currentFestival = 'default'; // You can dynamically set this value
  const role: string | null = localStorage.getItem('role'); // Handle null role gracefully
  console.log(role);

  return (
    <AuthProvider>
      <Router>
        <Toaster />
        <Navbar />
        <Routes>
          {/* Public Routes */}
          
            <Route path="/login" element={<LoginPage />} />
          
            
            {role !== null ? (
  <Route
    path="/"
    element={
      <WelcomePage
        bgImage={festivalBackgrounds[currentFestival] || festivalBackgrounds.default}
      />
    }
  />
) : (
  <Route path="/" element={<LoginPage />} />
)}
          {/* Doctor Routes */}
          {role === 'Doctor' && 
          <>
            <Route path="/appointment" element={<Appointment />} />
          </>
          }
          
          
          {/* Pharmacist Routes */}
          {role === 'Pharmacist' && (
            <>
              <Route path="/stockupdate" element={<PharmacyStockUpdate />} />
              <Route path="/billing" element={<Billing />} />
            </>
          )}

          {/* Shared Routes */}
              <Route path="/history" element={<Component />} />
              <Route path="/patients" element={<Patients />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
