import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function TroupeDetailScreen({ route, navigation }) {
  const { troupeId } = route.params;
  const { troupes, user } = useAuth();
  const { theme } = useTheme();
  
  const troupe = troupes.find(t => t.id === troupeId);
  
  if (!troupe) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textPrimary }}>Troupe not found</Text>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my Troupe "${troupe.name}" on Troupe!\n\nInvite code: ${troupe.inviteCode}\n\nDownload Troupe app to focus together!`,
        title: 'Invite to Troupe',
      });
    } catch (error) {
      Alert.alert('Invite Code', troupe.inviteCode);
    }
  };

  const isAdmin = troupe.members?.some(m => m.id === user.id && m.role === 'admin');

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Troupe Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <View style={[styles.crest, { backgroundColor: troupe.color }]}>
          <Text style={styles.crestEmoji}>{troupe.icon}</Text>
        </View>
        <Text style={[styles.name, { color: theme.textPrimary }]}>{troupe.name}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {troupe.description || 'No description'}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>{troupe.level}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Level</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>{troupe.totalMinutes}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Minutes</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>{troupe.memberCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Members</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.secondary }]}
          onPress={() => Alert.alert('Start Session', 'Starting a focus session with your troupe!')}
        >
          <Text style={styles.actionButtonText}>🎯 Start Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButtonOutline, { borderColor: theme.border }]}
          onPress={handleShare}
        >
          <Text style={[styles.actionButtonOutlineText, { color: theme.primary }]}>📤 Invite</Text>
        </TouchableOpacity>
      </View>

      {/* Members Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Members</Text>
        {troupe.members?.map((member, index) => (
          <View key={index} style={[styles.memberCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.memberAvatar, { backgroundColor: member.avatarColor }]}>
              <Text style={styles.memberAvatarEmoji}>{member.avatar}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: theme.textPrimary }]}>{member.username}</Text>
              {member.role === 'admin' && (
                <View style={[styles.adminBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.adminBadgeText, { color: theme.primary }]}>Admin</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Invite Code */}
      <View style={[styles.inviteCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.inviteLabel, { color: theme.textSecondary }]}>Invite Code</Text>
        <Text style={[styles.inviteCode, { color: theme.primary }]}>{troupe.inviteCode}</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={[styles.copyText, { color: theme.primary }]}>Share Code →</Text>
        </TouchableOpacity>
      </View>

      {isAdmin && (
        <TouchableOpacity
          style={[styles.adminButton, { backgroundColor: theme.danger + '20' }]}
          onPress={() => Alert.alert('Admin', 'Troupe settings coming soon!')}
        >
          <Text style={[styles.adminButtonText, { color: theme.danger }]}>Troupe Settings</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  crest: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  crestEmoji: {
    fontSize: 48,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: -20,
    marginBottom: 24,
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonOutline: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionButtonOutlineText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarEmoji: {
    fontSize: 24,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  inviteCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  inviteLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  inviteCode: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  copyText: {
    fontSize: 14,
  },
  adminButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  adminButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
