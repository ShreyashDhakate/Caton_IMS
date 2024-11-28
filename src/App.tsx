import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import WelcomePage from './components/WelcomePage';
import './index.css';
// import Dashboard from './components/Dashboard';
import LoginPage from './components/Login';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext'; 
// import ProfileComponent from './containers/Profile';
// import AnnouncementPage from './components/Announcement';

import PharmacyStockUpdate from './components/StockUpdate';
import Billing from './components/Billing';
import Appointment from './components/Appointment';
import Component from './components/History';
// import Inventory from './components/Inventory';

// Custom festival backgrounds
const festivalBackgrounds = {
  diwali: 'https://example.com/diwali-bg.jpg',
  christmas: 'https://example.com/christmas-bg.jpg',
  eid: 'https://example.com/eid-bg.jpg',
  default: 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg',
};

const App: React.FC = () => {
  const currentFestival = 'default'; // You can dynamically set this value

  return (
    <AuthProvider> {/* Wrap the app with AuthProvider */}
      <Router>
        <Toaster />
        <Navbar />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          
          <Route
            path="/welcome"
            element={
              <WelcomePage
                bgImage={festivalBackgrounds[currentFestival] || festivalBackgrounds.default}
              />
            }
          />
          <Route path="/appointment" element={<Appointment/>} />
          <Route path="/history" element={<Component/>} />
          <Route path="/stockupdate" element={<PharmacyStockUpdate/>}/>
          <Route path="/billing" element={<Billing/>}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
