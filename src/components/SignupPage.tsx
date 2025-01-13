import React, { useState } from "react";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/sonner";
import { invoke } from "@tauri-apps/api/core";
import Lottie from "react-lottie";
import step1Animation from "./animations/growth.json";
import step2Animation from "./animations/payment.json";
import step3Animation from "./animations/success.json";

const SignupPage: React.FC = () => {
  const [step, setStep] = useState(1); // State to manage the current step
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [isDataValid, setIsDataValid] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const animations = [step1Animation, step2Animation, step3Animation];

  const defaultOptions = {
    loop: step === 3,
    autoplay: true,
    animationData: animations[step - 1],
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const validateData = () => {
    if (!name || !email || !mobile) {
      addToast("Please fill out all required fields.", "info");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast("Please enter a valid email address.", "error");
      return false;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      addToast("Please enter a valid 10-digit mobile number.", "error");
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateData()) {
        setIsDataValid(true);
        setStep(step + 1);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="flex h-[92vh]">
      <div className="relative w-1/2">
        <div className="absolute top-24 left-24 w-3/4 h-3/4 z-10">
          {step !== 3 && (
            <Lottie options={defaultOptions} height="100%" width="100%" />
          )}
        </div>
      </div>

      <div className="w-1/2 bg-gray-50 p-8">
        {step === 1 && (
          <>
            <h2 className="text-3xl font-bold text-center mb-12">
              Step 1: Basic Information
            </h2>
            <div className="space-y-6">
              <input
                type="text"
                placeholder="Name"
                className="w-full p-3 border rounded-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 border rounded-md"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="text"
                placeholder="Mobile Number"
                className="w-full p-3 border rounded-md"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              <button
                className="w-full p-3 bg-blue-500 text-white rounded-md"
                onClick={handleNextStep}
              >
                NEXT
              </button>
            </div>
          </>
        )}

        {step === 2 && isDataValid && (
          <SubscriptionTab
            username={username}
            name={name}
            email={email}
            mob={mobile}
          />
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-3/4 h-1/2">
              <Lottie options={defaultOptions} height="100%" width="100%" />
            </div>
            <h3 className="text-4xl font-bold mt-6">
              Your Application is Submitted, Customer!
            </h3>
            <h3 className="text-sm font-bold mt-6">
              The user ID and password will be sent to your email within 24
              hours. Stay tuned!
            </h3>
            <button
              className="mt-6 p-3 bg-blue-500 text-white rounded-md"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        )}
        {step > 1 && step < 3 && (
          <button
            className="mt-6 p-3 bg-gray-500 text-white rounded-md"
            onClick={handlePreviousStep}
          >
            BACK
          </button>
        )}
      </div>
    </div>
  );
};

// interface SubscriptionOptionProps {
//   duration: number;
//   price: string;
//   features: string[];
// }

interface SubscriptionTabProps {
  username: string;
  name: string;
  email: string;
  mob: string;
}

const SubscriptionTab: React.FC<SubscriptionTabProps> = ({ username, name, email, mob }) => {
  const [months, setMonths] = useState(1); // Number of months selected
  const [showQRCode, setShowQRCode] = useState(false);
  const [submitted, setSubmitted] = useState(false); // State to control thank-you message visibility

  const totalAmount = months * 2500; // Calculate the total price

  const handleSendSubscriptionDetails = async () => {
    try {
      const response = await invoke("new_subscription", {
        username,
        name,
        email,
        mob,
        months,
        totalAmount,
      });

      console.log("Subscription details sent successfully:", response);
      setSubmitted(true); // Show thank-you message on success
    } catch (error) {
      console.error("Failed to send subscription details:", error);
      alert("Failed to send subscription details. Please try again.");
    }
  };

  const handleSubscribeClick = () => {
    setShowQRCode(true);
  };

  return (
    <div className="p-6 rounded-lg">
      {!submitted ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Get a Subscription</h2>
          <p className="mb-4">
            Choose the number of months for your subscription plan. Each month costs Rs. 2500.
          </p>
          <div className="mb-4">
            <label className="block mb-2 font-bold">Number of Months:</label>
            <input
              type="number"
              min="1"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <p className="mb-4 font-semibold">Total Amount: Rs. {totalAmount}</p>

          {showQRCode && (
            <div className="flex justify-center my-8">
              <QRCode
                value={`upi://pay?pa=shreyashdhakate20@oksbi&am=${totalAmount}`}
                size={200}
              />
            </div>
          )}
          <button
            onClick={handleSubscribeClick}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mr-4"
          >
            Generate QR Code
          </button>
          {showQRCode && (
            <button
              onClick={handleSendSubscriptionDetails}
              className="bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600"
            >
              Apply for Subscription
            </button>
          )}
        </>
      ) : (
        <div className="text-center fade-in animation">
          <h3 className="text-lg font-bold text-green-600">
            Your Application is Submitted
          </h3>
          <h3 className="text-sm font-bold mt-6">
            The user ID and password will be sent to your email within 24
            hours. Stay tuned!
          </h3>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
