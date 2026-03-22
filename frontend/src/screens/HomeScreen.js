import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors, typography } from '../styles/theme';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [troupes, setTroupes] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      const [troupesRes, sessionsRes] = await Promise.all([
        api.get('/troupes'),
        api.get('/sessions/active')
      ]);
      setTroupes(troupesRes.data.troupes);
      setActiveSessions(sessionsRes.data.sessions);
    } catch (error) {
      console.error('Load home data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  async function startSession() {
    if (troupes.length === 0) {
      Alert.alert('No Troupes', 'Create or join a Troupe first');
      navigation.navigate('CreateTroupe');
      return;
    }

    // Simple: use first troupe
    const troupe = troupes[0];
    try {
      const response = await api.post('/sessions', {
        troupeId: troupe.id,
        durationMinutes: 25,
        breakDurationMinutes: 5
      });
      navigation.navigate('Session', { sessionId: response.data.session.id });
    } catch (error) {
      Alert.alert('Error', 'Failed to start session');
    }
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>{user?.username}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{user?.avatarEmoji || '😊'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.currentStreakDays || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.focusGems || 0}</Text>
            <Text style={styles.statLabel}>Gems</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.floor((user?.totalFocusMinutes || 0) / 60)}</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
        </View>
      </View>

      {/* Quick Action */}
      <TouchableOpacity style={styles.focusButton} onPress={startSession}>
        <Ionicons name="play-circle" size={24} color="#FFFFFF" />
        <Text style={styles.focusButtonText}>Start Focus Session</Text>
      </TouchableOpacity>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Sessions</Text>
          {activeSessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              onPress={() => navigation.navigate('Session', { sessionId: session.id })}
            >
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>{session.title || 'Focus Session'}</Text>
                <Text style={styles.sessionTroupe}>{session.troupe.name}</Text>
              </View>
              <View style={styles.sessionStatus}>
                <View style={styles.activeDot} />
                <Text style={styles.sessionStatusText}>Active</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* My Troupes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Troupes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreateTroupe')}>
            <Text style={styles.sectionLink}>+ New</Text>
          </TouchableOpacity>
        </View>

        {troupes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎭</Text>
            <Text style={styles.emptyTitle}>No Troupes Yet</Text>
            <Text style={styles.emptyText}>Create or join a Troupe to start focusing with friends</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateTroupe')}
            >
              <Text style={styles.emptyButtonText}>Create Troupe</Text>
            </TouchableOpacity>
          </View>
        ) : (
          troupes.map((troupe) => (
            <TouchableOpacity
              key={troupe.id}
              style={styles.troupeCard}
              onPress={() => navigation.navigate('Troupe', { troupeId: troupe.id })}
            >
              <View style={[styles.troupeCrest, { backgroundColor: troupe.crestColor }]}>
                <Text style={styles.troupeEmoji}>{troupe.crestEmoji}</Text>
              </View>
              <View style={styles.troupeInfo}>
                <Text style={styles.troupeName}>{troupe.name}</Text>
                <Text style={styles.troupeLevel}>Level {troupe.level}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24
  },
  greeting: {
    ...typography.caption,
    color: colors.textSecondary
  },
  username: {
    ...typography.heading,
    fontSize: 28,
    color: colors.textPrimary
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarEmoji: {
    fontSize: 28
  },
  statsCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    ...typography.heading,
    fontSize: 32,
    color: colors.textPrimary
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border
  },
  focusButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 24,
    marginTop: 24,
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  focusButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600'
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.textPrimary
  },
  sectionLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600'
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  sessionInfo: {
    flex: 1
  },
  sessionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary
  },
  sessionTroupe: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4
  },
  sessionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary
  },
  sessionStatusText: {
    ...typography.caption,
    color: colors.secondary
  },
  troupeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  troupeCrest: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  troupeEmoji: {
    fontSize: 28
  },
  troupeInfo: {
    flex: 1
  },
  troupeName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary
  },
  troupeLevel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24
  },
  emptyButtonText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600'
  }
});
