import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Navbar: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Retrieve role from local storage
  const role: string = localStorage.getItem('role') || '';

  // Open the logout confirmation dialog
  const handleClickOpen = () => setOpen(true);

  // Close the logout confirmation dialog
  const handleClose = () => setOpen(false);

  // Handle logout
  const handleLogout = async () => {
    try {
      logout(); // Update auth context
      localStorage.removeItem('UserId');
      localStorage.removeItem('role');
      setActiveDropdown(null); // Reset active dropdowns
      toast.success('You are logged out!');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
      console.error('Logout error:', error);
    } finally {
      handleClose();
    }
  };

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
                <button
                  onClick={handleClickOpen}
                  className="text-white hover:text-gray-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-white hover:text-gray-300">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white rounded-lg shadow-md w-80 z-1000">
            <div className="p-4">
              <h2 className="text-lg font-semibold">Logout Confirmation</h2>
              <p className="text-gray-700 mt-2">
                Are you sure you want to logout?
              </p>
            </div>
            <div className="flex justify-end p-4 space-x-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
