import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ onStartFocus, onCreateTroupe, onBuyGems, onUpgrade }) {
  const { user, stats, troupes } = useAuth();
  const { theme } = useTheme();
  
  const hours = Math.floor((stats?.minutes || 0) / 60);
  const minutes = (stats?.minutes || 0) % 60;
  const [refreshing, setRefreshing] = React.useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    // In real app, sync with server
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Card */}
      <View style={[styles.welcomeCard, { backgroundColor: theme.primary }]}>
        <View>
          <Text style={styles.welcomeGreeting}>Hello,</Text>
          <Text style={styles.welcomeName}>{user?.username || 'Friend'}!</Text>
        </View>
        <View style={[styles.avatarCircle, { backgroundColor: user?.avatarColor || theme.primaryDark }]}>
          <Text style={styles.avatarEmoji}>{user?.avatar || '😊'}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statEmoji, { color: theme.warning }]}>🔥</Text>
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{stats?.streak || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Streak</Text>
        </View>
        
        <TouchableOpacity style={[styles.statBox, { backgroundColor: theme.surface }]} onPress={onBuyGems}>
          <Text style={[styles.statEmoji, { color: theme.secondary }]}>💎</Text>
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{stats?.gems || 100}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Gems</Text>
        </TouchableOpacity>
        
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statEmoji, { color: theme.primary }]}>⏱️</Text>
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{hours}h {minutes}m</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Focused</Text>
        </View>
      </View>

      {/* Start Focus Button */}
      <TouchableOpacity style={[styles.focusButton, { backgroundColor: theme.secondary }]} onPress={onStartFocus}>
        <Text style={styles.focusButtonText}>🎯 Start Focus Session</Text>
        <Text style={styles.focusButtonSubtext}>Earn gems & build streaks!</Text>
      </TouchableOpacity>

      {/* My Troupes Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>My Troupes</Text>
          <TouchableOpacity onPress={onCreateTroupe}>
            <Text style={[styles.sectionLink, { color: theme.primary }]}>+ Create</Text>
          </TouchableOpacity>
        </View>

        {troupes.length === 0 ? (
          <TouchableOpacity style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={onCreateTroupe}>
            <Text style={styles.emptyEmoji}>🎭</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Troupes Yet</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Create your first Troupe to focus with friends!</Text>
            <View style={[styles.emptyButton, { backgroundColor: theme.primary }]}>
              <Text style={styles.emptyButtonText}>Create Troupe →</Text>
            </View>
          </TouchableOpacity>
        ) : (
          troupes.slice(0, 2).map(troupe => (
            <View key={troupe.id} style={[styles.troupeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.troupeCrest, { backgroundColor: troupe.color }]}>
                <Text style={styles.troupeEmoji}>{troupe.icon}</Text>
              </View>
              <View style={styles.troupeInfo}>
                <Text style={[styles.troupeName, { color: theme.textPrimary }]}>{troupe.name}</Text>
                <Text style={[styles.troupeStats, { color: theme.textSecondary }]}>Level {troupe.level} • {troupe.members} members</Text>
                <Text style={[styles.troupeCode, { color: theme.textTertiary }]}>Code: {troupe.inviteCode}</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Invite Code', troupe.inviteCode)}>
                <Text style={[styles.shareText, { color: theme.primary }]}>Share</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Premium Banner */}
      {!user?.isPremium && (
        <TouchableOpacity style={[styles.premiumBanner, { backgroundColor: theme.warning + '20', borderColor: theme.warning }]} onPress={onUpgrade}>
          <Text style={styles.premiumBannerEmoji}>⭐</Text>
          <View style={styles.premiumBannerInfo}>
            <Text style={[styles.premiumBannerTitle, { color: theme.textPrimary }]}>Upgrade to Premium</Text>
            <Text style={[styles.premiumBannerText, { color: theme.textSecondary }]}>Unlock exclusive avatars, unlimited troupes & more!</Text>
          </View>
          <Text style={[styles.premiumBannerArrow, { color: theme.primary }]}>→</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    margin: 16,
    marginBottom: 20,
  },
  welcomeGreeting: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  welcomeName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  focusButton: {
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  focusButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  focusButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionLink: {
    fontSize: 14,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  troupeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    gap: 12,
  },
  troupeCrest: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  troupeEmoji: {
    fontSize: 28,
  },
  troupeInfo: {
    flex: 1,
  },
  troupeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  troupeStats: {
    fontSize: 12,
  },
  troupeCode: {
    fontSize: 10,
    marginTop: 2,
  },
  shareText: {
    fontSize: 12,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  premiumBannerEmoji: {
    fontSize: 32,
  },
  premiumBannerInfo: {
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  premiumBannerText: {
    fontSize: 12,
    marginTop: 2,
  },
  premiumBannerArrow: {
    fontSize: 20,
  },
});
