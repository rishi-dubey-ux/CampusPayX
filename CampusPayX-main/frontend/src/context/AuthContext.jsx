import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, SOCKET_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from local storage
  useEffect(() => {
    const checkLogged = async () => {
      const storedUser = localStorage.getItem('messpay_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // We could also verify token with backend here
      }
      setLoading(false);
    };
    checkLogged();
  }, []);

  const login = async (loginData) => {
    const res = await axios.post(`${API_URL}/auth/login`, loginData);
    setUser(res.data);
    localStorage.setItem('messpay_user', JSON.stringify(res.data));
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post(`${API_URL}/auth/register`, userData);
    setUser(res.data);
    localStorage.setItem('messpay_user', JSON.stringify(res.data));
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('messpay_user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
