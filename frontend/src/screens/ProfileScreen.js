import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ALL_AVATARS, COLOR_OPTIONS, FREE_AVATARS } from '../constants/data';

export default function ProfileScreen({ onEditProfile, onLogout }) {
  const { user, stats, updateUser } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.username || '');
  const [editAvatar, setEditAvatar] = useState(ALL_AVATARS.findIndex(a => a.emoji === user?.avatar) % ALL_AVATARS.length);
  const [editColor, setEditColor] = useState(COLOR_OPTIONS.indexOf(user?.avatarColor) % COLOR_OPTIONS.length);
  
  const hours = Math.floor((stats?.minutes || 0) / 60);
  const minutes = (stats?.minutes || 0) % 60;

  const handleSaveProfile = async () => {
    const newAvatar = ALL_AVATARS[editAvatar];
    if (newAvatar.premium && !user.isPremium) {
      Alert.alert('Premium Required', 'Upgrade to premium to use this avatar!');
      return;
    }
    
    await updateUser({
      username: editName,
      avatar: newAvatar.emoji,
      avatarColor: COLOR_OPTIONS[editColor],
    });
    
    setShowEditModal(false);
    Alert.alert('Success', 'Profile updated!');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: theme.surface }]}>
        <View style={[styles.avatar, { backgroundColor: user?.avatarColor }]}>
          <Text style={styles.avatarEmoji}>{user?.avatar || '😊'}</Text>
        </View>
        <Text style={[styles.name, { color: theme.textPrimary }]}>{user?.username}</Text>
        <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.primary + '20' }]}
          onPress={() => setShowEditModal(true)}
        >
          <Text style={[styles.editButtonText, { color: theme.primary }]}>Edit Profile</Text>
        </TouchableOpacity>
        {user?.isPremium && (
          <View style={[styles.premiumBadge, { backgroundColor: theme.warning }]}>
            <Text style={styles.premiumBadgeText}>⭐ Premium Member</Text>
          </View>
        )}
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Statistics</Text>
        <View style={[styles.statsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Focus Time</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{hours}h {minutes}m</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Current Streak</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats?.streak || 0} days</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Longest Streak</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats?.longestStreak || 0} days</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Gems Earned</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats?.gems || 0}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Sessions</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats?.sessions || 0}</Text>
          </View>
        </View>
      </View>

      {/* Appearance Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Appearance</Text>
        <TouchableOpacity
          style={[styles.settingOption, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => !isDark && toggleTheme()}
        >
          <Text style={[styles.settingText, { color: theme.textPrimary }]}>Light Mode</Text>
          <View style={[styles.radio, !isDark && styles.radioActive]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.settingOption, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => isDark && toggleTheme()}
        >
          <Text style={[styles.settingText, { color: theme.textPrimary }]}>Dark Mode</Text>
          <View style={[styles.radio, isDark && styles.radioActive]} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.danger }]}
        onPress={onLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: theme.textTertiary }]}>Troupe v1.0.0</Text>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Edit Profile</Text>
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Username"
              placeholderTextColor={theme.textTertiary}
              value={editName}
              onChangeText={setEditName}
            />
            
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Avatar</Text>
            <View style={styles.avatarRow}>
              {ALL_AVATARS.map((avatar, index) => {
                const isPremium = avatar.premium;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      if (isPremium && !user.isPremium) {
                        Alert.alert('Premium Required', 'Upgrade to premium to use this avatar!');
                      } else {
                        setEditAvatar(index);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.modalAvatar,
                        editAvatar === index && { borderColor: COLOR_OPTIONS[editColor], borderWidth: 2 },
                        isPremium && !user.isPremium && styles.lockedAvatar,
                      ]}
                    >
                      {avatar.emoji}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <Text style={[styles.modalLabel, { color: theme.textSecondary, marginTop: 12 }]}>Color</Text>
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalColor,
                    { backgroundColor: color },
                    editColor === index && styles.modalColorSelected,
                  ]}
                  onPress={() => setEditColor(index)}
                />
              ))}
            </View>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={handleSaveProfile}
            >
              <Text style={styles.modalButtonText}>Save Changes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={[styles.modalCancel, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    borderRadius: 24,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 8,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  premiumBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingText: {
    fontSize: 16,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  radioActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalLabel: {
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalAvatar: {
    fontSize: 32,
    padding: 4,
    borderRadius: 30,
  },
  lockedAvatar: {
    opacity: 0.5,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalColorSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },
  modalButton: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancel: {
    fontSize: 14,
    padding: 12,
    marginTop: 8,
  },
});
