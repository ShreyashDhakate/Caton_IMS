import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Navbar: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [medicineAnchorEl, setMedicineAnchorEl] = useState<null | HTMLElement>(null);
  const [stockAnchorEl, setStockAnchorEl] = useState<null | HTMLElement>(null);

  const role: string = localStorage.getItem('role') || '';

  // Open the logout confirmation dialog
  const handleClickOpen = () => setOpen(true);

  // Close the logout confirmation dialog
  const handleClose = () => setOpen(false);

  // Handle logout
  const handleLogout = () => {
    logout();
    localStorage.removeItem('UserId');
    localStorage.removeItem('role');
    toast.success('You are logged out!');
    navigate('/login');
    handleClose();
  };

  // Open the Medicine dropdown menu
  const handleMedicineMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMedicineAnchorEl(event.currentTarget);
  };

  // Close the Medicine dropdown menu
  const handleMedicineMenuClose = () => {
    setMedicineAnchorEl(null);
  };

  // Open the Stock dropdown menu
  const handleStockMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setStockAnchorEl(event.currentTarget);
  };

  // Close the Stock dropdown menu
  const handleStockMenuClose = () => {
    setStockAnchorEl(null);
  };

  return (
    <nav className="bg-teal-700 text-white shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-2xl font-bold text-white no-underline">
          Caton Dashboard
        </Link>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              {role === 'Pharmacist' && (
                <Link to="/billing" className="hover:underline">
                  Billing
                </Link>
              )}

              {role === 'Pharmacist' && (
                <>
                  <button
                    className="hover:underline"
                    onClick={handleMedicineMenuOpen}
                  >
                    Medicine
                  </button>
                  {medicineAnchorEl && (
                    <div
                      className="absolute mt-2 bg-white text-black shadow-md rounded-md py-2"
                      onMouseLeave={handleMedicineMenuClose}
                    >
                      <Link
                        to="/editmedicine"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={handleMedicineMenuClose}
                      >
                        Edit Medicine Details
                      </Link>
                      <Link
                        to="/medmanager"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={handleMedicineMenuClose}
                      >
                        Medicine Stock
                      </Link>
                      <Link
                        to="/all-medicines"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={handleMedicineMenuClose}
                      >
                        All Stock
                      </Link>
                    </div>
                  )}
                </>
              )}

              {role === 'Pharmacist' && (
                <>
                  <button
                    className="hover:underline"
                    onClick={handleStockMenuOpen}
                  >
                    Stocks
                  </button>
                  {stockAnchorEl && (
                    <div
                      className="absolute mt-2 bg-white text-black shadow-md rounded-md py-2"
                      onMouseLeave={handleStockMenuClose}
                    >
                      <Link
                        to="/stockadd"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={handleStockMenuClose}
                      >
                        Add Stock
                      </Link>
                      <Link
                        to="/stockmanager"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={handleStockMenuClose}
                      >
                        Stock Manager
                      </Link>
                      <Link
                        to="/generate-report"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={handleStockMenuClose}
                      >
                        Generate Medicine Report
                      </Link>
                    </div>
                  )}
                </>
              )}

              {role === 'Doctor' && (
                <Link to="/appointment" className="hover:underline">
                  Appointment
                </Link>
              )}

              <Link to="/history" className="hover:underline">
                Analytics
              </Link>
              <Link to="/patients" className="hover:underline">
                Patients
              </Link>
              <button className="hover:underline" onClick={handleClickOpen}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:underline">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Logout Confirmation</h2>
            </div>
            <div className="px-6 py-4">
              <p>Are you sure you want to logout?</p>
            </div>
            <div className="px-6 py-4 flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800"
                onClick={handleLogout}
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
