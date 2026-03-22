import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { colors, typography } from '../styles/theme';

export default function StatsScreen() {
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [statsRes, achievementsRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/users/achievements')
      ]);
      setStats(statsRes.data);
      setAchievements(achievementsRes.data.achievements);
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const focusHours = Math.floor((stats.totalFocusMinutes || 0) / 60);
  const focusMinutes = (stats.totalFocusMinutes || 0) % 60;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Stats</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={32} color={colors.primary} />
          <Text style={styles.statNumber}>{focusHours}h {focusMinutes}m</Text>
          <Text style={styles.statLabel}>Total Focus Time</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="flame-outline" size={32} color={colors.primary} />
          <Text style={styles.statNumber}>{stats.currentStreakDays || 0}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trophy-outline" size={32} color={colors.primary} />
          <Text style={styles.statNumber}>{stats.longestStreakDays || 0}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
          <Text style={styles.statNumber}>{stats.distractionCount || 0}</Text>
          <Text style={styles.statLabel}>Distractions</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={32} color={colors.secondary} />
          <Text style={styles.statNumber}>{stats.completedSessions || 0}</Text>
          <Text style={styles.statLabel}>Sessions Completed</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="diamond-outline" size={32} color={colors.warning} />
          <Text style={styles.statNumber}>{stats.focusGems || 0}</Text>
          <Text style={styles.statLabel}>Focus Gems</Text>
        </View>
      </View>

      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                achievement.earned && styles.achievementEarned
              ]}
            >
              <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              {achievement.earned && (
                <View style={styles.earnedBadge}>
                  <Text style={styles.earnedText}>Earned</Text>
                </View>
              )}
            </View>
          ))}
        </View>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    width: '31%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  statNumber: {
    ...typography.subheading,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: 8
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center'
  },
  achievementsSection: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 40
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: 16
  },
  achievementsGrid: {
    gap: 12
  },
  achievementCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.6
  },
  achievementEarned: {
    opacity: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10'
  },
  achievementEmoji: {
    fontSize: 32
  },
  achievementName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1
  },
  achievementDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2
  },
  earnedBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  earnedText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 10
  }
});
