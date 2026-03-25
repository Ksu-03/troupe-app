import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

const LIGHT = {
  primary: '#6366F1',
  secondary: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  textPrimary: '#1F2937',
  textSecondary: '#4B5563',
  textTertiary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
};

const DARK = {
  primary: '#818CF8',
  secondary: '#34D399',
  danger: '#F87171',
  warning: '#FBBF24',
  background: '#111827',
  surface: '#1F2937',
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  border: '#374151',
  success: '#34D399',
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme');
      if (saved !== null) {
        setIsDark(saved === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const theme = isDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};
