import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function TroupesScreen({ onCreateTroupe, onJoinTroupe }) {
  const { troupes } = useAuth();
  const { theme } = useTheme();

  const handleShare = (troupe) => {
    Alert.alert('Invite Code', `Share this code with friends: ${troupe.inviteCode}`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Your Troupes</Text>
          <TouchableOpacity onPress={onCreateTroupe}>
            <Text style={[styles.sectionLink, { color: theme.primary }]}>+ Create</Text>
          </TouchableOpacity>
        </View>

        {troupes.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={styles.emptyEmoji}>🎭</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Troupes Yet</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Create or join a Troupe to start focusing with friends!</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.smallButton, { backgroundColor: theme.primary }]} onPress={onCreateTroupe}>
                <Text style={styles.smallButtonText}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallButtonOutline, { borderColor: theme.border }]} onPress={onJoinTroupe}>
                <Text style={[styles.smallButtonOutlineText, { color: theme.primary }]}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          troupes.map(troupe => (
            <View key={troupe.id} style={[styles.troupeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.troupeCrest, { backgroundColor: troupe.color }]}>
                <Text style={styles.troupeEmoji}>{troupe.icon}</Text>
              </View>
              <View style={styles.troupeInfo}>
                <Text style={[styles.troupeName, { color: theme.textPrimary }]}>{troupe.name}</Text>
                <Text style={[styles.troupeDescription, { color: theme.textSecondary }]} numberOfLines={1}>
                  {troupe.description || 'No description'}
                </Text>
                <View style={styles.troupeStats}>
                  <Text style={[styles.troupeStat, { color: theme.textTertiary }]}>Level {troupe.level}</Text>
                  <Text style={[styles.troupeStat, { color: theme.textTertiary }]}>{troupe.totalMinutes} min</Text>
                  <Text style={[styles.troupeStat, { color: theme.textTertiary }]}>{troupe.memberCount} members</Text>
                </View>
                <Text style={[styles.troupeCode, { color: theme.textTertiary }]}>Code: {troupe.inviteCode}</Text>
              </View>
              <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.primary }]} onPress={() => handleShare(troupe)}>
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
      
      <TouchableOpacity style={[styles.joinCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={onJoinTroupe}>
        <Text style={[styles.joinEmoji, { color: theme.primary }]}>🔑</Text>
        <Text style={[styles.joinTitle, { color: theme.textPrimary }]}>Have an invite code?</Text>
        <Text style={[styles.joinText, { color: theme.textSecondary }]}>Tap to join a Troupe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
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
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  smallButtonOutline: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  smallButtonOutlineText: {
    fontSize: 14,
    fontWeight: '500',
  },
  troupeCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    gap: 12,
  },
  troupeCrest: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  troupeEmoji: {
    fontSize: 32,
  },
  troupeInfo: {
    flex: 1,
  },
  troupeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  troupeDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  troupeStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 2,
  },
  troupeStat: {
    fontSize: 10,
  },
  troupeCode: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  shareButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  joinCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
  },
  joinEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  joinTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  joinText: {
    fontSize: 14,
  },
});
