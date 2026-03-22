import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { colors, typography } from '../styles/theme';

export default function TroupeScreen({ route, navigation }) {
  const { troupeId } = route.params;
  const [troupe, setTroupe] = useState(null);
  const [members, setMembers] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTroupe();
  }, []);

  async function loadTroupe() {
    try {
      const response = await api.get(`/troupes/${troupeId}`);
      setTroupe(response.data.troupe);
      setRecentSessions(response.data.recentSessions);
      
      const membersRes = await api.get(`/troupes/${troupeId}/members`);
      setMembers(membersRes.data.members);
    } catch (error) {
      console.error('Load troupe error:', error);
      Alert.alert('Error', 'Failed to load troupe');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  async function shareInvite() {
    try {
      await Share.share({
        message: `Join my Troupe "${troupe.name}" on Troupe! Use invite code: ${troupe.inviteCode}`,
        title: 'Invite to Troupe'
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }

  async function startSession() {
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.crest, { backgroundColor: troupe.crestColor }]}>
        <Text style={styles.crestEmoji}>{troupe.crestEmoji}</Text>
      </View>

      <Text style={styles.troupeName}>{troupe.name}</Text>
      <Text style={styles.troupeDescription}>{troupe.description || 'No description'}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{troupe.level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.floor(troupe.totalFocusMinutes / 60)}</Text>
          <Text style={styles.statLabel}>Hours</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{members.length}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.focusButton} onPress={startSession}>
          <Ionicons name="play" size={20} color="#FFFFFF" />
          <Text style={styles.focusButtonText}>Start Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.inviteButton} onPress={shareInvite}>
          <Ionicons name="share-social" size={20} color={colors.primary} />
          <Text style={styles.inviteButtonText}>Invite</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members</Text>
        {members.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={[styles.memberAvatar, { backgroundColor: member.avatarColor }]}>
              <Text style={styles.memberEmoji}>{member.avatarEmoji}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.username}</Text>
              <Text style={styles.memberStats}>
                {Math.floor(member.totalFocusMinutes / 60)}h • {member.sessionsCompleted} sessions
              </Text>
            </View>
            {member.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminText}>Admin</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {recentSessions.length === 0 ? (
          <Text style={styles.emptyText}>No sessions yet. Start one!</Text>
        ) : (
          recentSessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>{session.title || 'Focus Session'}</Text>
                <Text style={styles.sessionDate}>
                  {new Date(session.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.sessionDuration}>{session.durationMinutes} min</Text>
            </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  crest: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  crestEmoji: {
    fontSize: 48
  },
  troupeName: {
    ...typography.heading,
    textAlign: 'center',
    color: colors.textPrimary
  },
  troupeDescription: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 8,
    paddingHorizontal: 24
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    ...typography.heading,
    fontSize: 28,
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
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 24,
    gap: 12
  },
  focusButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  focusButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600'
  },
  inviteButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  inviteButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600'
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 40
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: 16
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  memberEmoji: {
    fontSize: 24
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12
  },
  memberName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary
  },
  memberStats: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2
  },
  adminBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  adminText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 10
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  sessionInfo: {
    flex: 1
  },
  sessionTitle: {
    ...typography.body,
    color: colors.textPrimary
  },
  sessionDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2
  },
  sessionDuration: {
    ...typography.caption,
    color: colors.textSecondary
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 24
  }
});
