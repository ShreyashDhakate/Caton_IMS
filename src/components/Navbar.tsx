import React, { useState } from 'react';
import { Link} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Navbar: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Retrieve role from local storage
  const role: string = localStorage.getItem('role') || '';
  

  

  // Toggle dropdown menus
  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  return (
    <nav className="bg-[#057a85]">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-2xl font-bold">
              Caton Dashboard
            </Link>
          </div>
          <div className="flex space-x-4">
            {isLoggedIn ? (
              <>
                {role === 'Pharmacist' && (
                  <>
                    <Link to="/billing" className="text-white hover:text-gray-300">
                      Billing
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown('medicine')}
                        className="text-white hover:text-gray-300"
                      >
                        Medicine
                      </button>
                      {activeDropdown === 'medicine' && (
                        <div className="absolute bg-white w-[12rem] shadow-md rounded-md mt-2 z-10">
                          <Link
                            to="/editmedicine"
                            onClick={() => toggleDropdown('')}
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                          >
                            Edit Medicine Details
                          </Link>
                          <Link
                            to="/medmanager"
                            onClick={() => toggleDropdown('')}
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                          >
                            Medicine Stock
                          </Link>
                          <Link
                            to="/all-medicines"
                            onClick={() => toggleDropdown('')}
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                          >
                            All Stock
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown('stocks')}
                        className="text-white hover:text-gray-300"
                      >
                        Stocks
                      </button>
                      {activeDropdown === 'stocks' && (
                        <div className="absolute bg-white w-[12rem] shadow-md rounded-md mt-2 z-10">
                          <Link
                            to="/stockadd"
                            onClick={() => toggleDropdown('')}
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                          >
                            Add Stock
                          </Link>
                          <Link
                            to="/stockmanager"
                            onClick={() => toggleDropdown('')}
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                          >
                            Stock Manager
                          </Link>
                          <Link
                            to="/generate-report"
                            onClick={() => toggleDropdown('')}
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                          >
                            Generate Medicine Report
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {role === 'Doctor' && (
                  <Link to="/appointment" className="text-white hover:text-gray-300">
                    Appointment
                  </Link>
                )}
                <Link to="/history" className="text-white hover:text-gray-300">
                  Analytics
                </Link>
                <Link to="/patients" className="text-white hover:text-gray-300">
                  Patients
                </Link>
                <Link to="/profile" className="text-white hover:text-gray-300">
                  Profile
                </Link>
                
              </>
            ) : (
              <Link to="/login" className="text-white hover:text-gray-300">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      
    </nav>
  );
};

export default Navbar;
