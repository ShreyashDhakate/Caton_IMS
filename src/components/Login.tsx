import React, { useState } from 'react';
import { Button, TextField, Typography, Container, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from context

  const handleLogin = () => {
    if (username === 'UnitedMinds' && password === 'JustZipIt') {
      // Successful login
      login(); // Call login function
      toast.success('You are successfully logged in!');
      navigate('/welcome'); // Navigate to the welcome page
    } else {
      // Failed login
      toast.error('Invalid username or password');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} style={{ padding: '20px', marginTop: '100px' }}>
        <Typography variant="h5" align="center">Login</Typography>
        <form noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
                Login
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
