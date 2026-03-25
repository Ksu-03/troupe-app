import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';

export default function FocusSessionScreen({ navigation, route }) {
  const { duration = 25, gemsStaked = 10 } = route.params || {};
  const { theme } = useTheme();
  
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    startSession();
    const timer = setInterval(() => {
      if (isActive && timeLeft > 0) {
        setTimeLeft(prev => prev - 1);
      } else if (timeLeft === 0 && isActive) {
        completeSession();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const startSession = async () => {
    try {
      const response = await api.post('/sessions/start', {
        duration,
        gemsStaked,
      });
      setSessionId(response.sessionId);
    } catch (error) {
      Alert.alert('Error', 'Failed to start session');
      navigation.goBack();
    }
  };

  const completeSession = async () => {
    setIsActive(false);
    Vibration.vibrate(1000);
    
    try {
      const response = await api.post(`/sessions/${sessionId}/complete`);
      Alert.alert(
        'Great job! 🎉',
        `You earned ${response.gemsEarned} gems!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save session');
      navigation.goBack();
    }
  };

  const distract = async () => {
    setIsActive(false);
    
    try {
      await api.post(`/sessions/${sessionId}/fail`);
      Alert.alert(
        'Keep trying! 💪',
        `You lost ${gemsStaked} gems. Don't give up!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      navigation.goBack();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.timerCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.timer, { color: theme.textPrimary }]}>
          {formatTime(timeLeft)}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: theme.primary },
            ]}
          />
        </View>
      </View>

      <View style={[styles.statsCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.statsText, { color: theme.textSecondary }]}>
          🎯 Session Duration
        </Text>
        <Text style={[styles.statsValue, { color: theme.primary }]}>
          {duration} minutes
        </Text>
        <Text style={[styles.statsText, { color: theme.textSecondary }]}>
          💎 Gems at stake
        </Text>
        <Text style={[styles.statsValue, { color: theme.warning }]}>
          {gemsStaked} gems
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.distractButton, { backgroundColor: theme.danger }]}
        onPress={distract}
      >
        <Text style={styles.distractButtonText}>I got distracted 😔</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  timerCard: {
    width: '100%',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  timer: {
    fontSize: 56,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
    gap: 8,
  },
  statsText: {
    fontSize: 14,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  distractButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  distractButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
