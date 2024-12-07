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
import { useAuth } from "../context/AuthContext";

interface LoginResponse {
  userId: string;
  hospital: string;
  address:string;
  phone:string;
  // Add other fields if needed
}


const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Doctor" | "Pharmacist">("Doctor");
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the login context

  const handleLogin = async () => {
    try {
      const rawResponse = await invoke<string>("login", {
        username,
        password,
        role,
      });
      login(); // Update auth context
      
      console.log("Raw Response (string):",rawResponse);
    console.log("Type of response:", typeof rawResponse);
    const response: LoginResponse = JSON.parse(rawResponse);

    console.log("Parsed Response (object):", response);
    console.log("Hospital:", response.hospital);

    localStorage.setItem("userId", response.userId);
    localStorage.setItem("hospital", response.hospital);
    localStorage.setItem("phone", response.phone);
    localStorage.setItem("address", response.address);
    localStorage.setItem("role", role);
      toast.success("You are successfully logged in!");
      navigate("/"); // Redirect to homepage
    } catch (error) {
      toast.error("Invalid username or password.");
    }
  };

  return (
    <Container component="main" maxWidth="xs" className="animate-fade-in">
      <Paper elevation={3} style={{ padding: "20px", marginTop: "100px" }}>
        <Typography variant="h5" align="center">
          Login
        </Typography>
        <form noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} style={{ textAlign: "center" }}>
              <ToggleButtonGroup
                value={role}
                exclusive
                onChange={(_event, newRole) => newRole && setRole(newRole)}
                aria-label="Role selection"
              >
                <ToggleButton value="Doctor" aria-label="Doctor" color="primary">
                  Doctor
                </ToggleButton>
                <ToggleButton
                  value="Pharmacist"
                  aria-label="Pharmacist"
                  color="primary"
                >
                  Pharmacist
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
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
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin}
              >
                Login
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" align="center">
                Don't have an account?{" "}
                <Button
                  color="primary"
                  onClick={() => navigate("/signup")}
                >
                  Sign up here
                </Button>
              </Typography>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
