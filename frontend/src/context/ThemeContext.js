import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============ COLORS ============
export const LIGHT_THEME = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#4B5563',
  textTertiary: '#6B7280',
  border: '#E5E7EB',
  tabBar: '#FFFFFF',
  tabBarInactive: '#9CA3AF',
};

export const DARK_THEME = {
  primary: '#818CF8',
  primaryDark: '#6366F1',
  secondary: '#34D399',
  danger: '#F87171',
  warning: '#FBBF24',
  background: '#111827',
  surface: '#1F2937',
  card: '#1F2937',
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  border: '#374151',
  tabBar: '#1F2937',
  tabBarInactive: '#6B7280',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    try {
      const saved = await AsyncStorage.getItem('theme');
      if (saved) {
        setIsDark(saved === 'dark');
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleTheme() {
    const newMode = !isDark;
    setIsDark(newMode);
    try {
      await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
