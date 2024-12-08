import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grow,
} from '@mui/material';
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
    <AppBar
      position="static"
      sx={{ width: '100%', backgroundColor: '#057A85', zIndex: 1201 }}
    >
      <Toolbar>
        <Typography
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontSize: '24px',
          }}
        >
          Caton Dashboard
        </Typography>

        <Box display="flex">
          {isLoggedIn ? (
            <>
              {role === 'Pharmacist' && (
                <Button color="inherit" component={Link} to="/billing">
                  Billing
                </Button>
              )}
              {role === 'Pharmacist' && (
                <>
                  <Button
                    color="inherit"
                    onClick={handleMedicineMenuOpen}
                  >
                    Medicine
                  </Button>
                  <Menu
                    anchorEl={medicineAnchorEl}
                    open={Boolean(medicineAnchorEl)}
                    onClose={handleMedicineMenuClose}
                    TransitionComponent={Grow}
                    sx={{
                      mt: 1, // Add spacing below the navbar
                      zIndex: 1200, // Ensure it's above other components
                      '& .MuiPaper-root': {
                        position: 'absolute', // Ensure absolute positioning
                        top: '100px', // Adjust dropdown position
                        left: '0px', // Align it horizontally as needed
                        transform: 'none', // Remove default transformations
                      },
                    }}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                  >
                    <MenuItem
                      component={Link}
                      to="/editmedicine"
                      onClick={handleMedicineMenuClose}
                    >
                      Edit Medicine Details
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/expiring-medicines"
                      onClick={handleMedicineMenuClose}
                    >
                      Expiring Medicines
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/all-medicines"
                      onClick={handleMedicineMenuClose}
                    >
                      All Stock
                    </MenuItem>
                  </Menu>
                </>
              )}

              {role === 'Pharmacist' && (
                <>
                  <Button
                    color="inherit"
                    onClick={handleStockMenuOpen}
                  >
                    Stocks
                  </Button>
                  <Menu
                    anchorEl={stockAnchorEl}
                    open={Boolean(stockAnchorEl)}
                    onClose={handleStockMenuClose}
                    TransitionComponent={Grow}
                    sx={{
                      mt: 1, // Add spacing below the navbar
                      zIndex: 1200, // Ensure it's above other components
                      '& .MuiPaper-root': {
                        position: 'absolute', // Ensure absolute positioning
                        top: '100px', // Adjust dropdown position
                        left: '0px', // Align it horizontally as needed
                        transform: 'none', // Remove default transformations
                      },
                    }}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                  >
                    <MenuItem
                      component={Link}
                      to="/stockadd"
                      onClick={handleStockMenuClose}
                    >
                      Add Stock
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/stockmanager"
                      onClick={handleStockMenuClose}
                    >
                      Stock Manager
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/generate-report"
                      onClick={handleStockMenuClose}
                    >
                      Generate Medicine Report
                    </MenuItem>
                  </Menu>
                </>
              )}

              {role === 'Doctor' && (
                <Button color="inherit" component={Link} to="/appointment">
                  Appointment
                </Button>
              )}
              <Button color="inherit" component={Link} to="/history">
                Analytics
              </Button>
              <Button color="inherit" component={Link} to="/patients">
                Patients
              </Button>
              <Button color="inherit" onClick={handleClickOpen}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* Logout Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Logout Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="primary">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;
