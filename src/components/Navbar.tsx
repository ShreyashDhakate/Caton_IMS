import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Navbar: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // State to control dialog visibility

  const handleClickOpen = () => {
    setOpen(true); // Open the confirmation dialog
  };

  const handleClose = () => {
    setOpen(false); // Close the confirmation dialog
  };

  const handleLogout = () => {
    logout();
    toast.success('You are logged out!');
    navigate('/'); // Redirect to login page
    handleClose();
  };

  return (
    <AppBar
      position="static"
      sx={{ width: '100%', backgroundColor: '#057A85' }}
      className="animate-fade-in"
    >
      <Toolbar>
        <Typography
          component={Link}
          to={isLoggedIn ? '/welcome' : '/'}
          style={{
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
              <Button color="inherit" component={Link} to="/billing">
                Billing
              </Button>
              <Button color="inherit" component={Link} to="/announcement">
                Announcement
              </Button>
              <Button color="inherit" component={Link} to="/stockupdate">
                Stock Update
              </Button>
              <Button color="inherit" onClick={handleClickOpen}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
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
