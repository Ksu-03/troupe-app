import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { colors, typography } from '../styles/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  async function handleUpgrade() {
    navigation.navigate('Payment', { productId: 'premium_monthly' });
  }

  async function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => logout() }
      ]
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: user?.avatarColor }]}>
          <Text style={styles.avatarEmoji}>{user?.avatarEmoji}</Text>
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <View style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.menuText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        
        {user?.isPremium ? (
          <View style={styles.premiumCard}>
            <Ionicons name="crown" size={24} color={colors.warning} />
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumTitle}>Premium Active</Text>
              <Text style={styles.premiumExpiry}>
                Expires: {new Date(user.premiumExpiresAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <Ionicons name="diamond" size={20} color="#FFFFFF" />
            <Text style={styles.upgradeText}>Upgrade to Premium</Text>
            <Text style={styles.upgradePrice}>$3.99/mo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.menuText}>Help Center</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="document-text-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.menuText}>Terms & Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Troupe v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  avatarEmoji: {
    fontSize: 48
  },
  username: {
    ...typography.heading,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: 4
  },
  email: {
    ...typography.body,
    color: colors.textSecondary
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  sectionTitle: {
    ...typography.subheading,
    fontSize: 16,
    color: colors.textSecondary,
    marginVertical: 12
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  menuText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    marginLeft: 12
  },
  logoutText: {
    color: colors.danger
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12
  },
  premiumInfo: {
    flex: 1
  },
  premiumTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.warning
  },
  premiumExpiry: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  upgradeText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
    marginLeft: 12
  },
  upgradePrice: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600'
  },
  version: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 24
  }
});
