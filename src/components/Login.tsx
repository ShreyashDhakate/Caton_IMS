import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/sonner";
import { invoke } from "@tauri-apps/api/core";
import { useAuth } from "../context/AuthContext";

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
  const { addToast } = useToast();

  const checkConnectivity = (): boolean => {
    if (navigator.onLine) {
      return true;
    } else {
      addToast("No internet connection. Please check your network.", "error");
      return false;
    }
  };

  const handleLogin = async () => {
    if (!checkConnectivity()) return;

    if (!username || !password) {
      addToast("Please enter both username and password.","info");
      return;
    }

    try {
      const response = await invoke<string>("login", {
        username,
        password,
        role,
      });

      const parsedResponse = JSON.parse(response);

      localStorage.setItem("userId", parsedResponse.userId);
      localStorage.setItem("hospital", parsedResponse.hospital);
      localStorage.setItem("phone", parsedResponse.phone);
      localStorage.setItem("address", parsedResponse.address);
      localStorage.setItem("role", role);

      addToast("Login successful!","success");
      login();
      navigate("/");
    } catch (error: any) {
      console.error("Login Error:", error);
      addToast("Invalid username or password.","error");
    }
  };

  const handleForgotPassword = async () => {
    if (step === "email") {
      if (!email) {
        addToast("Please enter your email address.","error");
        return;
      }

      try {
        await invoke("forgot_password", { email });
        addToast("OTP sent to your email.","success");
        setStep("otp");
      } catch (error: any) {
        console.error("Error sending OTP:", error);
        addToast("Failed to send OTP. Please try again.","error");
      }
    } else if (step === "otp") {
      if (!otp || !newPassword) {
        addToast("Please enter both OTP and new password.","info");
        return;
      }

      try {
        await invoke("reset_password", { email, otp, newPassword, role });
        addToast("Password reset successful! You can now log in.","success");
        setShowForgotPassword(false);
        setStep("email");
      } catch (error: any) {
        console.error("Error resetting password:", error);
        addToast("Failed to reset password. Please check your details.","error");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-4">Login</h1>
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setRole("Doctor")}
            className={`px-4 py-2 rounded-l-lg ${
              role === "Doctor" ? "bg-[#057a85] text-white" : "bg-gray-200"
            }`}
          >
            Doctor
          </button>
          <button
            onClick={() => setRole("Pharmacist")}
            className={`px-4 py-2 rounded-r-lg ${
              role === "Pharmacist" ? "bg-[#057a85] text-white" : "bg-gray-200"
            }`}
          >
            Pharmacist
          </button>
        </div>
        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-[#057a85]"
        >
          Login
        </button>
        <div className="text-center mt-4">
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-[#057a85] hover:underline"
          >
            Forgot Password?
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-gray-600">Don't have an account?</span>
          <button
            onClick={() => navigate("/signup")}
            className="text-[#057a85] hover:underline ml-1"
          >
            Sign up here
          </button>
        </div>
      </div>

      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
            {step === "email" && (
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057a85]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
            {step === "otp" && (
              <>
                <input
                  type="text"
                  placeholder="OTP"
                  className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057a85]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#057a85]"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setStep("email");
                }}
                className="px-4 py-2 bg-gray-300 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {step === "email" ? "Send OTP" : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
