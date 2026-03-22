import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStoredData();
  }, []);
  
  async function loadStoredData() {
    try {
      const token = await AsyncStorage.getItem('@troupe:token');
      const userData = await AsyncStorage.getItem('@troupe:user');
      
      if (token && userData) {
        api.defaults.headers.Authorization = `Bearer ${token}`;
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load auth data:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data;
    
    await AsyncStorage.setItem('@troupe:token', token);
    await AsyncStorage.setItem('@troupe:user', JSON.stringify(user));
    
    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(user);
    
    return user;
  }
  
  async function register(username, email, password, avatarEmoji, avatarColor) {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
      avatarEmoji,
      avatarColor
    });
    const { user, token } = response.data;
    
    await AsyncStorage.setItem('@troupe:token', token);
    await AsyncStorage.setItem('@troupe:user', JSON.stringify(user));
    
    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(user);
    
    return user;
  }
  
  async function logout() {
    await AsyncStorage.removeItem('@troupe:token');
    await AsyncStorage.removeItem('@troupe:user');
    delete api.defaults.headers.Authorization;
    setUser(null);
  }
  
  async function updateUser(updatedData) {
    const response = await api.put('/users/profile', updatedData);
    const updatedUser = response.data.user;
    
    await AsyncStorage.setItem('@troupe:user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    return updatedUser;
  }
  
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
