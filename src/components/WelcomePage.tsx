import React from 'react';
import { useNavigate } from 'react-router-dom';

interface WelcomePageProps {
  bgImage: string; // You can pass background URL or a color
}

const WelcomePage: React.FC<WelcomePageProps> = ({ bgImage }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const role: string = localStorage.getItem('role') || '';
    {role=='Pharmacist' && navigate('/billing');}
    {role=='Doctor' && navigate('/appointment');}
    
  };

  return (
    <div
      className="relative h-[92.4vh] w-full bg-cover bg-center animate-fade-in"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* Main content */}
      <div className="relative z-2 flex flex-col items-center justify-center h-full text-center text-white px-6">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-4 sm:text-5xl lg:text-6xl">
          Welcome to Caton Dashboard
        </h1>

        {/* Subtitle */}
        <p className="text-lg mb-8 sm:text-xl lg:text-2xl">
          Manage your appointments, billing, and resources all in one place.
        </p>

        {/* Button */}
        <button
          onClick={handleGetStarted}
          className="bg-[#057A85] text-white font-semibold py-3 px-8 rounded-lg hover:bg-[#04656b] transition duration-300 ease-in-out"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;