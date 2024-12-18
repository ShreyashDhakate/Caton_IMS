import React, { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";

// Toast Context for managing toasts
const ToastContext = createContext<any>(null);

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

type ToastProviderProps = {
  children: React.ReactNode;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000); // Auto-dismiss after 4 seconds
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const value = { addToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-4">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`relative w-72 p-4 rounded-lg shadow-lg transition-all duration-300 transform animate-toast-in ${
                toast.type === "success"
                  ? "border border-green-400 bg-green-100 text-green-700"
                  : toast.type === "error"
                  ? "border border-red-400 bg-red-100 text-red-700"
                  : "border border-blue-400 bg-blue-100 text-blue-700"
              }`}
            >
              {toast.message}
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-1 right-1 text-xs text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// Custom Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
