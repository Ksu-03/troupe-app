import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [troupes, setTroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, troupesData] = await Promise.all([
        api.get('/users/stats'),
        api.get('/users/troupes'),
      ]);
      setStats(statsData);
      setTroupes(troupesData.slice(0, 3));
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const startFocus = () => {
    navigation.navigate('FocusSession');
  };

  if (loading) {
    return <Loading />;
  }

  const hours = Math.floor((stats?.totalMinutes || 0) / 60);
  const minutes = (stats?.totalMinutes || 0) % 60;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Header */}
      <View style={[styles.welcomeCard, { backgroundColor: theme.primary }]}>
        <View>
          <Text style={styles.welcomeGreeting}>Hello,</Text>
          <Text style={styles.welcomeName}>{user?.username}!</Text>
        </View>
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: user?.avatarColor || theme.secondary },
          ]}
        >
          <Text style={styles.avatarEmoji}>{user?.avatar || '😊'}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={[styles.statEmoji, { color: theme.warning }]}>🔥</Text>
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
            {stats?.streak || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Streak
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={[styles.statEmoji, { color: theme.secondary }]}>💎</Text>
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
            {stats?.gems || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Gems
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={[styles.statEmoji, { color: theme.primary }]}>⏱️</Text>
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
            {hours}h {minutes}m
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Focused
          </Text>
        </Card>
      </View>

      {/* Focus Button */}
      <Button
        title="🎯 Start Focus Session"
        onPress={startFocus}
        style={styles.focusButton}
      />

      {/* Recent Troupes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            My Troupes
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Troupes')}>
            <Text style={[styles.sectionLink, { color: theme.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {troupes.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎭</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No Troupes Yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Create or join a troupe to get started
            </Text>
            <Button
              title="Create Troupe"
              onPress={() => navigation.navigate('CreateTroupe')}
              type="outline"
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          troupes.map((troupe) => (
            <TouchableOpacity
              key={troupe.id}
              onPress={() => navigation.navigate('TroupeDetail', { troupe })}
            >
              <Card style={styles.troupeCard}>
                <View
                  style={[
                    styles.troupeIcon,
                    { backgroundColor: troupe.color },
                  ]}
                >
                  <Text style={styles.troupeEmoji}>{troupe.icon}</Text>
                </View>
                <View style={styles.troupeInfo}>
                  <Text
                    style={[styles.troupeName, { color: theme.textPrimary }]}
                  >
                    {troupe.name}
                  </Text>
                  <Text
                    style={[
                      styles.troupeStats,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Level {troupe.level} • {troupe.memberCount} members
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Premium Banner */}
      {!user?.isPremium && (
        <TouchableOpacity
          style={[
            styles.premiumBanner,
            {
              backgroundColor: theme.warning + '20',
              borderColor: theme.warning,
            },
          ]}
          onPress={() => navigation.navigate('Shop')}
        >
          <Text>⭐</Text>
          <Text style={[styles.premiumText, { color: theme.textPrimary }]}>
            Upgrade to Premium
          </Text>
          <Text>→</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  welcomeGreeting: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  welcomeName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  focusButton: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
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
    fontSize: 13,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 8,
  },
  troupeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
  },
  troupeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    marginBottom: 2,
  },
  troupeStats: {
    fontSize: 12,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  premiumText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
