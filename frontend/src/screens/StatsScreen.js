import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const { stats } = useAuth();
  const { theme } = useTheme();
  
  const hours = Math.floor((stats?.minutes || 0) / 60);
  const minutes = (stats?.minutes || 0) % 60;
  
  // Calculate weekly progress (mock data for demo)
  const weeklyData = [45, 60, 30, 75, 50, 65, 40];
  const maxValue = Math.max(...weeklyData);
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Overview Cards */}
      <View style={styles.overviewGrid}>
        <View style={[styles.overviewCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.overviewValue, { color: theme.textPrimary }]}>{hours}h {minutes}m</Text>
          <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Total Focus</Text>
        </View>
        <View style={[styles.overviewCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.overviewValue, { color: theme.textPrimary }]}>{stats?.streak || 0}</Text>
          <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Day Streak</Text>
        </View>
        <View style={[styles.overviewCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.overviewValue, { color: theme.textPrimary }]}>{stats?.sessions || 0}</Text>
          <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Sessions</Text>
        </View>
        <View style={[styles.overviewCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.overviewValue, { color: theme.textPrimary }]}>{stats?.gems || 0}</Text>
          <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Gems Earned</Text>
        </View>
      </View>

      {/* Weekly Chart */}
      <View style={[styles.chartCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>This Week</Text>
        <View style={styles.chartBars}>
          {weeklyData.map((value, index) => (
            <View key={index} style={styles.chartBarContainer}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: (value / maxValue) * 80,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
              <Text style={[styles.chartLabel, { color: theme.textTertiary }]}>{days[index]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Achievements */}
      <View style={[styles.achievementsCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.achievementsTitle, { color: theme.textPrimary }]}>Achievements</Text>
        
        <View style={styles.achievementItem}>
          <Text style={styles.achievementEmoji}>🌟</Text>
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementName, { color: theme.textPrimary }]}>First Steps</Text>
            <Text style={[styles.achievementDesc, { color: theme.textSecondary }]}>Complete your first focus session</Text>
          </View>
          <View style={[styles.achievementBadge, { backgroundColor: theme.secondary + '20' }]}>
            <Text style={[styles.achievementBadgeText, { color: theme.secondary }]}>+50</Text>
          </View>
        </View>
        
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <View style={styles.achievementItem}>
          <Text style={styles.achievementEmoji}>🔥</Text>
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementName, { color: theme.textPrimary }]}>Flawless Week</Text>
            <Text style={[styles.achievementDesc, { color: theme.textSecondary }]}>No distractions for 7 days</Text>
          </View>
          <View style={[styles.achievementBadge, { backgroundColor: theme.border }]}>
            <Text style={[styles.achievementBadgeText, { color: theme.textTertiary }]}>+200</Text>
          </View>
        </View>
        
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <View style={styles.achievementItem}>
          <Text style={styles.achievementEmoji}>🎭</Text>
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementName, { color: theme.textPrimary }]}>Troupe Player</Text>
            <Text style={[styles.achievementDesc, { color: theme.textSecondary }]}>10 sessions with same Troupe</Text>
          </View>
          <View style={[styles.achievementBadge, { backgroundColor: theme.border }]}>
            <Text style={[styles.achievementBadgeText, { color: theme.textTertiary }]}>+150</Text>
          </View>
        </View>
      </View>

      {/* Badges */}
      <View style={[styles.badgesCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.badgesTitle, { color: theme.textPrimary }]}>Badges</Text>
        <View style={styles.badgesGrid}>
          <View style={styles.badgeItem}>
            <Text style={styles.badgeEmoji}>🎯</Text>
            <Text style={[styles.badgeName, { color: theme.textSecondary }]}>Focuser</Text>
          </View>
          <View style={styles.badgeItem}>
            <Text style={styles.badgeEmoji}>💎</Text>
            <Text style={[styles.badgeName, { color: theme.textSecondary }]}>Gem Collector</Text>
          </View>
          <View style={styles.badgeItem}>
            <Text style={styles.badgeEmoji}>🔥</Text>
            <Text style={[styles.badgeName, { color: theme.textSecondary }]}>Streaker</Text>
          </View>
          <View style={styles.badgeItem}>
            <Text style={styles.badgeEmoji}>🎭</Text>
            <Text style={[styles.badgeName, { color: theme.textSecondary }]}>Team Player</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  overviewCard: {
    width: '47%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  overviewLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  chartCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBarContainer: {
    alignItems: 'center',
    width: 30,
  },
  chartBar: {
    width: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 10,
  },
  achievementsCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievementDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  achievementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  achievementBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  badgesCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  badgeItem: {
    alignItems: 'center',
    width: 70,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 11,
    textAlign: 'center',
  },
});
