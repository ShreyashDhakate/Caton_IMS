import React, { useState } from "react";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/sonner";
import { invoke } from "@tauri-apps/api/core";
import Lottie from "react-lottie";
import step1Animation from "./animations/growth.json";
import step2Animation from "./animations/payment.json";
import step3Animation from "./animations/push.json";
import step4Animation from "./animations/success.json";

const SignupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
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
  const { addToast } = useToast();
  

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



  const handleSignup = async () => {
    // Validate required fields
    if (!name || !email || !mobile || !passwordDoc || !passwordPharma) {
      addToast("Please fill out all required fields.","info");
      return;
    }
  
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast("Please enter a valid email address.","error");
      return;
    }
  
    // Validate mobile format (assuming 10-digit numbers for example)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      addToast("Please enter a valid 10-digit mobile number.","error");
      return;
    }
  
    // Ensure passwords match
    if (passwordDoc !== passwordDocConfirm || passwordPharma !== passwordPharmaConfirm) {
      addToast("Passwords do not match!","error");
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
      addToast("Account created successfully!","success");
      setStep(4);
    } catch (error: any) {
      console.error("Signup error:", error);
      addToast(`Signup failed: ${error.message || error}`,"error");
    }
  };

  const handlePaymentDetection = () => {
    addToast("Payment received!","success");
    handleNextStep();
  };

  return (
    <div className="flex h-screen">
      <div className="relative w-1/2">
        <div className="absolute top-24 left-24 w-3/4 h-3/4 z-10">
          {step !== 4 && (
            <Lottie options={defaultOptions} height="100%" width="100%" />
          )}
        </div>
      </div>

      <div className="w-1/2 bg-gray-50 p-8">
        {step === 1 && (
          <>
            <h2 className="text-3xl font-bold text-center mb-12">Step 1: Basic Information</h2>
            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full p-3 border rounded-md"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full p-3 border rounded-md"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 border rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Mobile Number"
                  className="w-full p-3 border rounded-md"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
              <div>
                <button
                  className="w-full p-3 bg-blue-500 text-white rounded-md"
                  onClick={handleNextStep}
                >
                  NEXT
                </button>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-3xl font-bold text-center">Step 2: Payment Plan</h2>
            <p className="text-center mt-4">Pay ₹2000/month to enjoy these features:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>24/7 Consultation</li>
              <li>Access to exclusive features</li>
              <li>Comprehensive medical records</li>
            </ul>
            <div className="flex justify-center my-8">
              <QRCode value="upi://pay?pa=shreyashdhakate20@oksbi&am=2000" size={200} />
            </div>
            <div className="flex justify-between mt-6">
              <button
                className="w-1/2 p-3 bg-gray-300 text-black rounded-md"
                onClick={handlePreviousStep}
              >
                Back
              </button>
              <button
                className="w-1/2 p-3 bg-blue-500 text-white rounded-md"
                onClick={handlePaymentDetection}
              >
                I've Paid
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-3xl font-bold text-center">Step 3: Personal Details</h2>
            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Pharmacy/Hospital Name"
                  className="w-full p-3 border rounded-md"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Address"
                  className="w-full p-3 border rounded-md"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Doctor Password"
                  className="w-full p-3 border rounded-md"
                  value={passwordDoc}
                  onChange={(e) => setPasswordDoc(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm Doctor Password"
                  className="w-full p-3 border rounded-md"
                  value={passwordDocConfirm}
                  onChange={(e) => setPasswordDocConfirm(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Pharmacy Password"
                  className="w-full p-3 border rounded-md"
                  value={passwordPharma}
                  onChange={(e) => setPasswordPharma(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm Pharmacy Password"
                  className="w-full p-3 border rounded-md"
                  value={passwordPharmaConfirm}
                  onChange={(e) => setPasswordPharmaConfirm(e.target.value)}
                />
              </div>
              <div className="flex justify-between mt-6">
                <button
                  className="w-1/2 p-3 bg-gray-300 text-black rounded-md"
                  onClick={handlePreviousStep}
                >
                  Back
                </button>
                <button
                  className="w-1/2 p-3 bg-blue-500 text-white rounded-md"
                  onClick={handleSignup}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-3/4 h-1/2">
              <Lottie options={defaultOptions} height="100%" width="100%" />
            </div>
            <h3 className="text-4xl font-bold mt-6">Welcome to the board, Customer</h3>
            <button
              className="mt-6 p-3 bg-blue-500 text-white rounded-md"
              onClick={() => navigate("/login")}
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
