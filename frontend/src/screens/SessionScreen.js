import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  AppState
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { colors, typography } from '../styles/theme';

export default function SessionScreen({ route, navigation }) {
  const { sessionId } = route.params;
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isFocusPhase, setIsFocusPhase] = useState(true);
  const [myStatus, setMyStatus] = useState('focusing');
  const [loading, setLoading] = useState(true);
  
  const heartbeatInterval = useRef(null);
  const timerInterval = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    loadSession();
    setupSocket();
    setupMotionDetection();
    setupAppStateListener();

    return () => {
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (socket.current) socket.current.disconnect();
      Accelerometer.removeAllListeners();
    };
  }, []);

  async function loadSession() {
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      setSession(response.data.session);
      setParticipants(response.data.session.participants);
      
      // Set initial timer
      if (response.data.session.status === 'active') {
        const elapsed = Math.floor((Date.now() - new Date(response.data.session.startedAt)) / 1000);
        const remaining = response.data.session.durationMinutes * 60 - elapsed;
        setTimeRemaining(Math.max(0, remaining));
        startTimer();
        startHeartbeat();
      } else if (response.data.session.status === 'scheduled') {
        // Start the session if creator (in real app, you'd have a start button)
        if (response.data.session.createdById === session?.createdById) {
          await api.post(`/sessions/${sessionId}/start`);
          loadSession();
        }
      }
    } catch (error) {
      console.error('Load session error:', error);
      Alert.alert('Error', 'Failed to load session');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  function setupSocket() {
    socket.current = getSocket();
    socket.current.emit('join-session', sessionId);
    
    socket.current.on('participant-update', (data) => {
      setParticipants(prev => prev.map(p => 
        p.userId === data.userId ? { ...p, focusStatus: data.status } : p
      ));
    });
    
    socket.current.on('participant-distracted', (data) => {
      if (data.userId !== session?.createdById) {
        // Show toast or notification
      }
    });
    
    socket.current.on('session-ended', (data) => {
      Alert.alert('Session Complete', `You earned ${data.results.rewardPerFocused || 0} gems!`);
      navigation.replace('Home');
    });
  }

  async function setupMotionDetection() {
    Accelerometer.setUpdateInterval(1000);
    Accelerometer.addListener((data) => {
      // Simple motion detection
      const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      if (magnitude > 1.2 && myStatus === 'focusing') {
        reportDistraction('phone_movement');
      }
    });
  }

  function setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState !== 'active' && myStatus === 'focusing') {
        reportDistraction('app_switch');
      }
    });
  }

  function startHeartbeat() {
    heartbeatInterval.current = setInterval(async () => {
      try {
        await api.post(`/sessions/${sessionId}/heartbeat`, {
          motionData: { isMoving: false }, // Simplified
          foregroundApp: { isDistracting: false }
        });
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, 5000);
  }

  function startTimer() {
    timerInterval.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval.current);
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function reportDistraction(type) {
    if (myStatus !== 'focusing') return;
    
    try {
      await api.post(`/sessions/${sessionId}/report-distraction`, { distractionType: type });
      setMyStatus('distracted');
      
      socket.current.emit('focus-status-update', {
        sessionId,
        userId: session?.createdById,
        status: 'distracted'
      });
    } catch (error) {
      console.error('Report distraction error:', error);
    }
  }

  async function handleSessionEnd() {
    try {
      await api.post(`/sessions/${sessionId}/end`);
    } catch (error) {
      console.error('End session error:', error);
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading session...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.participantsGrid}>
        {participants.map((participant) => (
          <View key={participant.id} style={styles.participantCard}>
            <View style={[
              styles.participantAvatar,
              { backgroundColor: participant.user.avatarColor }
            ]}>
              <Text style={styles.participantEmoji}>{participant.user.avatarEmoji}</Text>
            </View>
            <Text style={styles.participantName}>{participant.user.username}</Text>
            <View style={[
              styles.statusDot,
              participant.focusStatus === 'focusing' ? styles.statusFocusing : styles.statusDistracted
            ]} />
          </View>
        ))}
      </View>

      <View style={styles.potCard}>
        <Text style={styles.potLabel}>Focus Pot</Text>
        <Text style={styles.potAmount}>{session.totalPotSize} gems</Text>
      </View>

      {myStatus === 'focusing' && (
        <TouchableOpacity
          style={styles.distractButton}
          onPress={() => reportDistraction('self_report')}
        >
          <Text style={styles.distractButtonText}>I need a break</Text>
        </TouchableOpacity>
      )}

      {myStatus === 'distracted' && (
        <View style={styles.distractedMessage}>
          <Ionicons name="sad-outline" size={24} color={colors.warning} />
          <Text style={styles.distractedText}>You've been distracted</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20
  },
  timer: {
    ...typography.heading,
    fontSize: 32,
    fontFamily: 'monospace',
    color: colors.textPrimary
  },
  participantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 16
  },
  participantCard: {
    alignItems: 'center',
    width: 80,
    marginBottom: 16
  },
  participantAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  participantEmoji: {
    fontSize: 32
  },
  participantName: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4
  },
  statusFocusing: {
    backgroundColor: colors.secondary
  },
  statusDistracted: {
    backgroundColor: colors.danger
  },
  potCard: {
    backgroundColor: colors.surface,
    margin: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  potLabel: {
    ...typography.caption,
    color: colors.textSecondary
  },
  potAmount: {
    ...typography.heading,
    fontSize: 28,
    color: colors.primary,
    marginTop: 8
  },
  distractButton: {
    backgroundColor: colors.danger,
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  distractButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600'
  },
  distractedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24
  },
  distractedText: {
    ...typography.body,
    color: colors.warning
  }
});
