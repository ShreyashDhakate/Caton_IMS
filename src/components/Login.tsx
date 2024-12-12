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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { useAuth } from "../context/AuthContext";

interface LoginResponse {
  userId: string;
  hospital: string;
  address: string;
  phone: string;
}

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Doctor" | "Pharmacist">("Doctor");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("Please enter both username and password.");
      return;
    }

    try {
      const response = await invoke<string>("login", {
        username,
        password,
        role,
      });

      const parsedResponse: LoginResponse = JSON.parse(response);

      // Save user data to localStorage
      localStorage.setItem("userId", parsedResponse.userId);
      localStorage.setItem("hospital", parsedResponse.hospital);
      localStorage.setItem("phone", parsedResponse.phone);
      localStorage.setItem("address", parsedResponse.address);
      localStorage.setItem("role", role);

      toast.success("Login successful!");
      login(); // Update auth context
      navigate("/"); // Redirect to the homepage
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error("Invalid username or password.");
    }
  };

  const handleForgotPassword = async () => {
    if (step === "email") {
      if (!email) {
        toast.error("Please enter your email address.");
        return;
      }

      try {
        await invoke("forgot_password", { email });
        toast.success("OTP sent to your email.");
        setStep("otp");
      } catch (error: any) {
        console.error("Error sending OTP:", error);
        toast.error("Failed to send OTP. Please try again.");
      }
    } else if (step === "otp") {
      if (!otp || !newPassword) {
        toast.error("Please enter both OTP and new password.");
        return;
      }

      try {
        await invoke("reset_password", { email, otp, newPassword, role });
        toast.success("Password reset successful! You can now log in.");
        setShowForgotPassword(false);
        setStep("email");
      } catch (error: any) {
        console.error("Error resetting password:", error);
        toast.error("Failed to reset password. Please check your details.");
      }
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
                onChange={(_, newRole) => newRole && setRole(newRole)}
                aria-label="Role selection"
              >
                <ToggleButton value="Doctor" aria-label="Doctor">
                  Doctor
                </ToggleButton>
                <ToggleButton value="Pharmacist" aria-label="Pharmacist">
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
            <Grid item xs={12} style={{ textAlign: "center" }}>
              <Button
                color="primary"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
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

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onClose={() => setShowForgotPassword(false)}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          {step === "email" && (
            <TextField
              variant="outlined"
              label="Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: "10px" }}
            />
          )}
          {step === "otp" && (
            <>
              <TextField
                variant="outlined"
                label="OTP"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ marginBottom: "10px" }}
              />
              <TextField
                variant="outlined"
                label="New Password"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowForgotPassword(false);
              setStep("email");
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleForgotPassword} color="primary">
            {step === "email" ? "Send OTP" : "Reset Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LoginPage;
