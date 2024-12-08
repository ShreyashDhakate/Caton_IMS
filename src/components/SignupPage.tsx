import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Container,
  Grid,
} from "@mui/material";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import Lottie from "react-lottie";
import step1Animation from "./animations/growth.json";
import step2Animation from "./animations/payment.json";
import step3Animation from "./animations/push.json";
import step4Animation from "./animations/success.json"; // Importing the fourth animation

const SignupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); // New state for username
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [hospital, setHospital] = useState("");
  const [passwordDoc, setPasswordDoc] = useState("");
  const [passwordDocConfirm, setPasswordDocConfirm] = useState("");
  const [passwordPharma, setPasswordPharma] = useState("");
  const [passwordPharmaConfirm, setPasswordPharmaConfirm] = useState("");
  const navigate = useNavigate();

  // Adding the new animation to the array
  const animations = [
    step1Animation,
    step2Animation,
    step3Animation,
    step4Animation,
  ];

  const defaultOptions = {
    loop: (step ===3),
    autoplay: true,
    animationData: animations[step - 1], // Adjusted to use the correct animation based on the step
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  // Handle navigation between steps
  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePreviousStep = () =>
    setStep((prev) => (prev > 1 ? prev - 1 : prev));

  // Simulate payment detection
  const handlePaymentDetection = () => {
    setTimeout(() => {
      toast.success("Payment received!");
      setStep(3);
    }, 2000);
  };

  // Handle the signup process
  const handleSignup = async () => {
    if (!name || !email || !mobile || !passwordDoc || !passwordPharma) {
      toast.error("Please fill out all fields.");
      return;
    }
    
    if (
      passwordDoc !== passwordDocConfirm ||
      passwordPharma !== passwordPharmaConfirm
    ) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      await invoke("signup", {
        username,
        name,
        email,
        mobile,
        hospital,
        address,
        passwordDoc,
        passwordPharma,
      });
      toast.success("Account created successfully!");
      setStep(4);
    } catch (error) {
      toast.error(`Signup failed: ${error}`);
    }
  };

  return (
    <Grid container style={{ height: "70vh" }}>
      <Grid container style={{ height: "70vh" }}>
      {/* Left side: Lottie animation */}
      <Grid item xs={6} style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 100,
            width: "70%",
            height: "70%",
            zIndex: -1,
          }}
        >
         {step==4? "": <Lottie options={defaultOptions} height="100%" width="100%" />} 
        </div>
      </Grid>

      {/* Right side: Signup Form */}
      <Grid item xs={6} >
        <Container
          component="main"
          maxWidth={"md"}
          className="animate-fade-in m-12"
          style={{
            position: "relative",
            zIndex: 1,
            padding: "20px",
            height: "70vh",
          }}
        >
          
            {step === 1 && (
              <>
                <Typography
                  variant="h5"
                  align="center"
                  style={{ marginBottom: "3rem" }}
                >
                  Step 1: Basic Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      label="Name"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      label="Username" // New field for username
                      fullWidth
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      label="Email"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      label="Mobile Number"
                      fullWidth
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleNextStep}
                    >
                      Next
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={() => navigate("/login")}
                      style={{ marginTop: "10px" }}
                    >
                      Back to Login
                    </Button>
                  </Grid>
                </Grid>
              </>
            )}
            {step === 2 && (
              <>
                <Typography variant="h5" align="center">
                  Step 2: Payment Plan
                </Typography>
                <Typography align="center">
                  Pay ₹2000/month to enjoy these features:
                </Typography>
                <ul className="text-center">
                  <li>24/7 Consultation</li>
                  <li>Access to exclusive features</li>
                  <li>Comprehensive medical records</li>
                </ul>
                <div className="text-center justify-center flex m-10">
                  <QRCode
                    value="upi://pay?pa=shreyashdhakate20@oksbi&am=2000"
                    size={200}
                  />
                </div>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={handlePreviousStep}
                    >
                      Back
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handlePaymentDetection}
                    >
                      I've Paid
                    </Button>
                  </Grid>
                </Grid>
              </>
            )}
            {step === 3 && (
              <>
                <Typography variant="h5" align="center">
                  Step 3: Personal Details
                </Typography>
                <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      label="Pharmacy/Hospital Name"
                      fullWidth
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      label="Address"
                      fullWidth
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      label="Doctor Password"
                      type="password"
                      fullWidth
                      value={passwordDoc}
                      onChange={(e) => setPasswordDoc(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      label="Confirm Doctor Password"
                      type="password"
                      fullWidth
                      value={passwordDocConfirm}
                      onChange={(e) => setPasswordDocConfirm(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      label="Pharmacy Password"
                      type="password"
                      fullWidth
                      value={passwordPharma}
                      onChange={(e) => setPasswordPharma(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      label="Confirm Pharmacy Password"
                      type="password"
                      fullWidth
                      value={passwordPharmaConfirm}
                      onChange={(e) =>
                        setPasswordPharmaConfirm(e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={handlePreviousStep}
                    >
                      Back
                    </Button>
                  </Grid>

                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleSignup}
                    >
                      Sign Up
                    </Button>
                  </Grid>
                </Grid>
              </>
            )}
        
        </Container>
      </Grid>
      </Grid>
            {step === 4 && (
              <Grid
                container
                alignItems="center"
                justifyContent="center"
                direction="column"
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: -1,
                  }}
                >
                  <Lottie options={defaultOptions} height="100%" width="100%" />
                </div>
                <Typography
                  variant="h3"
                  align="center"
                  style={{
                    position: "absolute",
                    zIndex: 1,
                    color: "#333",
                    fontWeight: "bold",
                    width: "100%",
                    top: "40%",
                    fontSize: "3rem", // Larger font size
                  }}
                >
                  Welcome to the board, Customer
                </Typography>
                <Grid item xs={6} style={{ marginTop: "2rem" }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => navigate("/login")}
                  >
                    Go to Login
                  </Button>
                </Grid>
              </Grid>
            )}

    </Grid>
  );
};

export default SignupPage;
