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
import step4Animation from "./animations/success.json";

const SignupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [hospital, setHospital] = useState("");
  const [passwordDoc, setPasswordDoc] = useState("");
  const [passwordDocConfirm, setPasswordDocConfirm] = useState("");
  const [passwordPharma, setPasswordPharma] = useState("");
  const [passwordPharmaConfirm, setPasswordPharmaConfirm] = useState("");
  const navigate = useNavigate();

  const animations = [
    step1Animation,
    step2Animation,
    step3Animation,
    step4Animation,
  ];

  const defaultOptions = {
    loop: step === 3,
    autoplay: true,
    animationData: animations[step - 1],
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePreviousStep = () =>
    setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email to receive OTP.");
      return;
    }

    try {
      await invoke("signup", { 
        username,
        name,
        mobile,
        address,
        hospital,
        passwordDoc,
        passwordPharma,
        email,
       });
      setOtpSent(true);
      toast.success("OTP sent to your email!");
    } catch (error: any) {
      (otpVerified || toast.error(`Failed to send OTP: ${error.message || error}`));
      
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    try {
      await invoke("verify_signup", { 
        username,
        name,
        mobile,
        address,
        hospital,
        passwordDoc,
        passwordPharma,
        email,
        otp, });
      setOtpVerified(true);
      toast.success("OTP verified successfully!");
      handleNextStep();
    } catch (error: any) {
      toast.error(`Invalid or expired OTP: ${error.message || error}`);
    }
  };

  const handleSignup = async () => {
    // Validate required fields
    if (!name || !email || !mobile || !passwordDoc || !passwordPharma) {
      toast.error("Please fill out all required fields.");
      return;
    }
  
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
  
    // Validate mobile format (assuming 10-digit numbers for example)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
  
    // Ensure passwords match
    if (passwordDoc !== passwordDocConfirm || passwordPharma !== passwordPharmaConfirm) {
      toast.error("Passwords do not match!");
      return;
    }
  
    // Log the username value
    console.log("Signup data being sent:", { username, name, email, mobile, passwordDoc, passwordPharma });
  
    try {
      await invoke("signup", {
        username,
        name,
        mobile,
        address,
        hospital,
        passwordDoc,
        passwordPharma,
        email,
      });
      toast.success("Account created successfully!");
      setStep(4);
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(`Signup failed: ${error.message || error}`);
    }
  };
  
  

  const handlePaymentDetection = () => {
    toast.success("Payment received!");
    handleNextStep();
  };

  return (
    <Grid container style={{ height: "100vh" }}>
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
          {step !== 4 && (
            <Lottie options={defaultOptions} height="100%" width="100%" />
          )}
        </div>
      </Grid>

      <Grid item xs={6}>
        <Container component="main" maxWidth="md" style={{ padding: "20px" }}>
          {step === 1 && (
            <>
              <Typography variant="h5" align="center" style={{ marginBottom: "3rem" }}>
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
                    label="Username"
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
                    onClick={handleSendOtp}
                    disabled={otpSent}
                  >
                    {otpSent ? "OTP Sent" : "Send OTP"}
                  </Button>
                </Grid>
                {otpSent && (
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      label="Enter OTP"
                      fullWidth
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleVerifyOtp}
                    >
                      Verify OTP
                    </Button>
                  </Grid>
                )}
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
              <ul>
                <li>24/7 Consultation</li>
                <li>Access to exclusive features</li>
                <li>Comprehensive medical records</li>
              </ul>
              <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
                <QRCode value="upi://pay?pa=shreyashdhakate20@oksbi&am=2000" size={200} />
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

          {step === 4 && (
            <Grid
              container
              alignItems="center"
              justifyContent="center"
              direction="column"
              style={{ textAlign: "center" }}
            >
              <div style={{ width: "80%", height: "50%" }}>
                <Lottie options={defaultOptions} height="100%" width="100%" />
              </div>
              <Typography variant="h3" align="center" style={{ fontWeight: "bold" }}>
                Welcome to the board, Customer
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </Grid>
          )}
        </Container>
      </Grid>
    </Grid>
  );
};

export default SignupPage;
