import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import WelcomePage from './components/WelcomePage';
import './index.css';
import Dashboard from './components/Dashboard';
import LoginPage from './components/Login';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext'; // Import the AuthProvider

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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<div>History Page</div>} />
          <Route path="/announcement" element={<div>Announcement Page</div>} />
          <Route path="/profile" element={<div>Profile Page</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
