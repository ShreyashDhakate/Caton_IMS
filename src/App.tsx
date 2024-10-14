import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import WelcomePage from './components/WelcomePage';
import './index.css';
import Dashboard from './components/Dashboard';
import LoginPage from './components/Login';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext'; 
// import ProfileComponent from './containers/Profile';
import AnnouncementPage from './components/Announcement';
import { Component } from './components/History';
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
          {/* <Route path="/dashboard" element={<Inventory />} /> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<Component/>} />
          <Route path="/announcement" element={<AnnouncementPage/>} />
          {/* <Route path="/profile" element={<ProfileComponent bgImage={festivalBackgrounds[currentFestival] || festivalBackgrounds.default}/>} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
