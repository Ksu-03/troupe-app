import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FREE_AVATARS, COLOR_OPTIONS } from '../constants/data';

export default function AuthScreen() {
  const { register, login } = useAuth();
  const { theme } = useTheme();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!isLogin) {
      if (!username) {
        setError('Username is required');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>🎯 Troupe</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Focus together with friends
        </Text>
      </View>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: theme.danger + '20' }]}>
          <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
        </View>
      ) : null}

      {!isLogin && (
        <>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
            placeholder="Username"
            placeholderTextColor={theme.textTertiary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Choose Avatar</Text>
          <View style={styles.avatarRow}>
            {FREE_AVATARS.map((avatar, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.avatarOption,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  selectedAvatar === index && styles.avatarSelected,
                  selectedAvatar === index && { borderColor: COLOR_OPTIONS[selectedColor] }
                ]}
                onPress={() => setSelectedAvatar(index)}
              >
                <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                <Text style={[styles.avatarName, { color: theme.textSecondary }]}>{avatar.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Choose Color</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.slice(0, 8).map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === index && styles.colorSelected
                ]}
                onPress={() => setSelectedColor(index)}
              />
            ))}
          </View>
        </>
      )}

      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
        placeholder="Email"
        placeholderTextColor={theme.textTertiary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
        placeholder="Password"
        placeholderTextColor={theme.textTertiary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {!isLogin && (
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Confirm Password"
          placeholderTextColor={theme.textTertiary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: !isLogin ? COLOR_OPTIONS[selectedColor] : theme.primary }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(''); }}>
        <Text style={[styles.link, { color: theme.primary }]}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 13,
    marginTop: 12,
    marginBottom: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  avatarOption: {
    width: 70,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
  },
  avatarSelected: {
    borderWidth: 3,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  avatarName: {
    fontSize: 10,
    marginTop: 4,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
});
