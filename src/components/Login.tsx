import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { useAuth } from "../context/AuthContext"; // Import the useAuth hook

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordDoc, setPasswordDoc] = useState("");
  const [passwordPharma, setPasswordPharma] = useState("");
  const [email, setEmail] = useState(""); // For signup functionality
  const [role, setRole] = useState<"Doctor" | "Pharmacist">("Doctor"); // Role state
  const [isSignup, setIsSignup] = useState(false); // Toggle between login and signup
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from context

  const handleLogin = async () => {
    try {
      // Call Tauri backend login command
      const userId = await invoke<string>("login", {
        username,
        password,
        role,
      });
      login(); // Update auth context on successful login
      localStorage.setItem("userId", userId); // Store userId in localStorage
      localStorage.setItem("role", role);
      toast.success("You are successfully logged in!");
      navigate("/"); // Navigate to the welcome page
    } catch (error) {
      toast.error("Invalid username or password");
    }
  };

  const handleSignup = async () => {
    try {
      // Call Tauri backend signup command
      await invoke("signup", { username, passwordDoc, passwordPharma, email });
      toast.success("Account created successfully! You can now log in.");
      setIsSignup(false); // Switch back to login mode
    } catch (error) {
      toast.error("Signup failed: " + error);
    }
  };

  const handleSubmit = () => {
    if (isSignup) {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  return (
    <Container component="main" maxWidth="xs" className="animate-fade-in">
      <Paper elevation={3} style={{ padding: "20px", marginTop: "100px" }}>
        <Typography variant="h5" align="center">
          {isSignup ? "Sign Up" : "Login"}
        </Typography>
        <form noValidate>
          <Grid container spacing={2}>
          {!isSignup && 
          
          <Grid item xs={12} style={{ textAlign: "center" }}>
          <ToggleButtonGroup
              value={role}
              exclusive
              onChange={(event, newRole) => newRole && setRole(newRole)}
              aria-label="Role selection"
            >
              <ToggleButton value="Doctor" aria-label="Doctor" color="primary">
                Doctor
              </ToggleButton>
              <ToggleButton value="Pharmacist" aria-label="Pharmacist" color="primary">
                Pharmacist
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          
          }
            
            {isSignup && (
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  label="Email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Grid>
            {!isSignup && (
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
            )}
            {isSignup && (
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  label="PasswordDoc"
                  type="password"
                  fullWidth
                  value={passwordDoc}
                  onChange={(e) => setPasswordDoc(e.target.value)}
                />
              </Grid>
            )}
            {isSignup && (
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  label="PasswordPharma"
                  type="password"
                  fullWidth
                  value={passwordPharma}
                  onChange={(e) => setPasswordPharma(e.target.value)}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSubmit}
              >
                {isSignup ? "Sign Up" : "Login"}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" align="center">
                {isSignup ? (
                  <>
                    Already have an account?{" "}
                    <Button color="primary" onClick={() => setIsSignup(false)}>
                      Login here
                    </Button>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <Button color="primary" onClick={() => setIsSignup(true)}>
                      Sign up here
                    </Button>
                  </>
                )}
              </Typography>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
