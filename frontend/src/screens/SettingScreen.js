import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
            logout();
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Appearance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Appearance</Text>
        
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => toggleTheme()}
        >
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Notifications</Text>
        
        <View style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
        
        <View style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Sound Effects</Text>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Account</Text>
        
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => Alert.alert('Coming Soon', 'Change password will be available soon!')}
        >
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Change Password</Text>
          <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => Alert.alert('Coming Soon', 'Data export will be available soon!')}
        >
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Export Data</Text>
          <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Support</Text>
        
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => Alert.alert('Help Center', 'Visit our website for help:\nhttps://troupe.app/help')}
        >
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Help Center</Text>
          <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => Alert.alert('About', 'Troupe v1.0.0\n\nFocus together with friends')}
        >
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>About</Text>
          <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => Alert.alert('Rate Us', 'Thanks for using Troupe! Please rate us on the app store.')}
        >
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Rate Us</Text>
          <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.danger }]}>Danger Zone</Text>
        
        <TouchableOpacity
          style={[styles.dangerItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handleLogout}
        >
          <Text style={[styles.dangerText, { color: theme.danger }]}>Logout</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.dangerItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.dangerText, { color: theme.danger }]}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: theme.textTertiary }]}>Troupe v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingArrow: {
    fontSize: 16,
  },
  dangerItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 32,
  },
});
