import React, { useState } from "react";
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
  const [, setOtpVerified] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [hospital, setHospital] = useState("");
  const [passwordDoc, setPasswordDoc] = useState("");
  const [passwordDocConfirm] = useState("");
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
      toast.error(`Failed to send OTP: ${error.message || error}`);
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
        otp,
      });
      setOtpVerified(true);
      toast.success("OTP verified successfully!");
      handleNextStep();
    } catch (error: any) {
      toast.error(`Invalid or expired OTP: ${error.message || error}`);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !mobile || !passwordDoc || !passwordPharma) {
      toast.error("Please fill out all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (passwordDoc !== passwordDocConfirm || passwordPharma !== passwordPharmaConfirm) {
      toast.error("Passwords do not match!");
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
      toast.success("Account created successfully!");
      setStep(4);
    } catch (error: any) {
      toast.error(`Signup failed: ${error.message || error}`);
    }
  };

  const handlePaymentDetection = () => {
    toast.success("Payment received!");
    handleNextStep();
  };

  return (
    <div className="flex h-screen">
      {/* Left Side with Animation */}
      <div className="w-1/2 flex items-center justify-center bg-gray-100 relative">
        {step !== 4 && (
          <div className="absolute top-20 left-20 w-3/4 h-3/4">
            <Lottie options={defaultOptions} height="100%" width="100%" />
          </div>
        )}
      </div>

      {/* Right Side with Form */}
      <div className="w-1/2 flex flex-col justify-center items-center p-8">
        {step === 1 && (
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6">Step 1: Basic Information</h2>
            <div className="space-y-4">
              <input
                type="text"
                className="w-full p-3 border rounded"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="text"
                className="w-full p-3 border rounded"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="email"
                className="w-full p-3 border rounded"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="tel"
                className="w-full p-3 border rounded"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              <button
                onClick={handleSendOtp}
                disabled={otpSent}
                className={`w-full p-3 rounded ${
                  otpSent ? "bg-gray-400" : "bg-blue-600 text-white"
                }`}
              >
                {otpSent ? "OTP Sent" : "Send OTP"}
              </button>
              {otpSent && (
                <>
                  <input
                    type="text"
                    className="w-full p-3 border rounded mt-2"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button
                    onClick={handleVerifyOtp}
                    className="w-full p-3 bg-green-600 text-white rounded mt-2"
                  >
                    Verify OTP
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6">Step 2: Payment Plan</h2>
            <p className="text-center">Pay ₹2000/month to enjoy these features:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>24/7 Consultation</li>
              <li>Exclusive Features</li>
              <li>Medical Records</li>
            </ul>
            <div className="flex justify-center mb-4">
              <QRCode value="upi://pay?pa=shreyashdhakate20@oksbi&am=2000" size={200} />
            </div>
            <div className="flex gap-4">
              <button onClick={handlePreviousStep} className="w-full p-3 bg-gray-300 rounded">
                Back
              </button>
              <button
                onClick={handlePaymentDetection}
                className="w-full p-3 bg-blue-600 text-white rounded"
              >
                I've Paid
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6">Step 3: Personal Details</h2>
            <div className="space-y-4">
              <input
                type="text"
                className="w-full p-3 border rounded"
                placeholder="Hospital/Pharmacy Name"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
              />
              <input
                type="text"
                className="w-full p-3 border rounded"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <input
                type="password"
                className="w-full p-3 border rounded"
                placeholder="Doctor Password"
                value={passwordDoc}
                onChange={(e) => setPasswordDoc(e.target.value)}
              />
              <input
                type="password"
                className="w-full p-3 border rounded"
                placeholder="Confirm Doctor Password"
                value={passwordDocConfirm}
                onChange={(e) => setPasswordDoc(e.target.value)}
                />
                <input
                  type="password"
                  className="w-full p-3 border rounded"
                  placeholder="Pharmacist Password"
                  value={passwordPharma}
                  onChange={(e) => setPasswordPharma(e.target.value)}
                />
                <input
                  type="password"
                  className="w-full p-3 border rounded"
                  placeholder="Confirm Pharmacist Password"
                  value={passwordPharmaConfirm}
                  onChange={(e) => setPasswordPharmaConfirm(e.target.value)}
                />
                <div className="flex gap-4">
                  <button onClick={handlePreviousStep} className="w-full p-3 bg-gray-300 rounded">
                    Back
                  </button>
                  <button
                    onClick={handleSignup}
                    className="w-full p-3 bg-blue-600 text-white rounded"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
  
          {step === 4 && (
            <div className="w-full max-w-md">
              <h2 className="text-2xl font-bold text-center mb-6">Success!</h2>
              <p className="text-center">Your account has been created successfully.</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full mt-6 p-3 bg-green-600 text-white rounded"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default SignupPage;
  
