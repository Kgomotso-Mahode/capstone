import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, updateUserRole as apiUpdateRole } from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('client_user');
      const token = localStorage.getItem('client_token');
      if (stored && token) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem('client_user');
      localStorage.removeItem('client_token');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('client_token', data.token);
    localStorage.setItem('client_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (username, email, password) => {
    const data = await apiRegister(username, email, password);
    localStorage.setItem('client_token', data.token);
    localStorage.setItem('client_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const becomeHost = async () => {
    try {
      const updatedUser = await apiUpdateRole('host');
      const stored = { ...JSON.parse(localStorage.getItem('client_user') || '{}'), role: 'host' };
      localStorage.setItem('client_user', JSON.stringify(stored));
      setUser(stored);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, becomeHost, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
