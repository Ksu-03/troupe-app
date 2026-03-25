import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  type = 'primary', // primary, secondary, outline, danger
  style,
  textStyle,
}) {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    switch (type) {
      case 'secondary':
        return { backgroundColor: theme.secondary };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.primary,
        };
      case 'danger':
        return { backgroundColor: theme.danger };
      default:
        return { backgroundColor: theme.primary };
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'outline':
        return { color: theme.primary };
      default:
        return { color: '#FFF' };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});
