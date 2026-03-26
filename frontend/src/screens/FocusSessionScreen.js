import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function FocusSessionScreen({ session, onEnd, onDistract }) {
  const { stats, updateStats, user } = useAuth();
  const { theme } = useTheme();
  
  const [timeLeft, setTimeLeft] = useState(session.duration * 60);
  const [status, setStatus] = useState('focusing');
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSessionEnd = async () => {
    // Calculate earnings (all focused participants share the pot)
    // For solo session, you get all gems back + bonus
    const earned = session.pot;
    
    const newStats = {
      ...stats,
      gems: stats.gems + earned,
      minutes: stats.minutes + session.duration,
      streak: stats.streak + 1,
      sessions: (stats.sessions || 0) + 1,
    };
    
    await updateStats(newStats);
    
    Alert.alert('Session Complete!', `You earned ${earned} gems!\nStreak: ${newStats.streak} days`);
    onEnd();
  };
  
  const handleDistract = async () => {
    setStatus('distracted');
    
    const lostGems = session.gems;
    const newStats = {
      ...stats,
      gems: stats.gems - lostGems,
    };
    
    await updateStats(newStats);
    
    Alert.alert('Session Failed', `You lost ${lostGems} gems. Next time, stay focused!`);
    onDistract();
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.timerCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.timer, { color: theme.textPrimary }]}>{formatTime(timeLeft)}</Text>
        <Text style={[styles.phase, { color: status === 'focusing' ? theme.secondary : theme.danger }]}>
          {status === 'focusing' ? '🔴 FOCUSING' : '😔 DISTRACTED'}
        </Text>
      </View>
      
      <View style={[styles.potCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.potLabel, { color: theme.textSecondary }]}>Current Pot</Text>
        <Text style={[styles.potAmount, { color: theme.primary }]}>{session.pot} 💎</Text>
      </View>
      
      {status === 'focusing' && (
        <TouchableOpacity
          style={[styles.distractButton, { backgroundColor: theme.danger }]}
          onPress={handleDistract}
        >
          <Text style={styles.distractButtonText}>I got distracted 😔</Text>
        </TouchableOpacity>
      )}
      
      <Text style={[styles.tip, { color: theme.textTertiary }]}>
        {status === 'focusing' ? 'Keep your phone down to stay focused!' : 'Next time, try putting your phone away!'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  timerCard: {
    width: '100%',
    padding: 40,
    borderRadius: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  timer: {
    fontSize: 64,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  phase: {
    fontSize: 18,
    marginTop: 12,
  },
  potCard: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  potLabel: {
    fontSize: 14,
  },
  potAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  distractButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: 'center',
  },
  distractButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  tip: {
    fontSize: 12,
    marginTop: 24,
    textAlign: 'center',
  },
});
