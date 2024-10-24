import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../context/AuthContext'; // Import the AuthContext
import { toast } from 'sonner'; // Import toast for notifications

const Navbar: React.FC = () => {
  const { isLoggedIn, logout } = useAuth(); // Access authentication state
  const navigate = useNavigate(); // Get the navigate function

  const handleLogout = () => {
    logout(); // Call the logout function
    toast.success('You are logged out!'); // Show logout message
    navigate('/'); // Redirect to the login page
  };

  return (
    <AppBar position="static" sx={{ width: '100%', backgroundColor: '#057A85' }} className='animate-fade-in'>
      <Toolbar>
        <Typography
          component={Link}
          to="/welcome"
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
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/billing">
                Billing
              </Button>
              {/* <Button color="inherit" component={Link} to="/history">
                History
              </Button> */}
              <Button color="inherit" component={Link} to="/announcement">
                Announcement
              </Button>
              <Button color="inherit" component={Link} to="/stockupdate">
                Stockupdate
              </Button>
              <Button color="inherit" onClick={handleLogout}> {/* Update onClick to handleLogout */}
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
    </AppBar>
  );
};

export default Navbar;
