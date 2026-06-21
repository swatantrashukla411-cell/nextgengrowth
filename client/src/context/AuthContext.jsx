import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('ngg_token');
      const storedUser = localStorage.getItem('ngg_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify token against backend and sync profile
          const res = await API.get('/api/profile');
          if (res.data && res.data.success) {
            const updatedUser = res.data.user;
            setUser(updatedUser);
            localStorage.setItem('ngg_user', JSON.stringify(updatedUser));
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          // If we fail due to network, do not log out immediately, only on 401 (handled by Axios interceptor)
          if (err.response && err.response.status === 401) {
            handleLogout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLogin = async (email, password, role) => {
    try {
      const res = await API.post('/api/login', { email, password, role });
      if (res.data && res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('ngg_token', receivedToken);
        localStorage.setItem('ngg_user', JSON.stringify(receivedUser));
        return { success: true, user: receivedUser };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      console.error('Login request failed:', err);
      const message = err.response?.data?.message || 'Server error. Please check your connection.';
      return { success: false, message };
    }
  };

  const handleRegister = async (payload) => {
    try {
      const res = await API.post('/api/register', payload);
      if (res.data && res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('ngg_token', receivedToken);
        localStorage.setItem('ngg_user', JSON.stringify(receivedUser));
        return { success: true, user: receivedUser };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err) {
      console.error('Registration request failed:', err);
      const message = err.response?.data?.message || 'Server error. Please check your connection.';
      return { success: false, message };
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ngg_token');
    localStorage.removeItem('ngg_user');
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('ngg_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        updateProfileState,
        isAuthenticated: !!token,
      }}
    >
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
