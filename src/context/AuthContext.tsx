import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const storedLoginTime = localStorage.getItem('loginTime');
    if (storedLoginTime) {
      const loginTime = new Date(parseInt(storedLoginTime, 10));
      const currentTime = new Date();
      if (currentTime.getTime() - loginTime.getTime() < SIX_HOURS_MS) {
        return true;
      } else {
        localStorage.removeItem('loginTime'); // Expired session
      }
    }
    return false;
  });

  const login = () => {
    const currentTime = new Date();
    localStorage.setItem('loginTime', currentTime.getTime().toString());
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('loginTime');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
