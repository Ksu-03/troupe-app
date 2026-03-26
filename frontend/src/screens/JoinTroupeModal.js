import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { TROUPE_ICONS, COLOR_OPTIONS } from '../constants/data';

export default function JoinTroupeModal({ visible, onClose }) {
  const { user, troupes, addTroupe } = useAuth();
  const { theme } = useTheme();
  
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }
    
    setLoading(true);
    
    const code = inviteCode.trim().toUpperCase();
    
    // Check if already in this troupe
    const existingTroupe = troupes.find(t => t.inviteCode === code);
    if (existingTroupe) {
      Alert.alert('Already Joined', `You are already a member of ${existingTroupe.name}`);
      setLoading(false);
      return;
    }
    
    // In a real app, you would verify with server
    // For demo, create a demo troupe
    const newTroupe = {
      id: 'joined-' + Date.now(),
      name: 'Joined Troupe',
      description: 'A troupe you joined',
      icon: TROUPE_ICONS[Math.floor(Math.random() * TROUPE_ICONS.length)],
      color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)],
      level: 1,
      totalMinutes: 0,
      memberCount: 3,
      inviteCode: code,
      members: [],
      joinedAt: new Date().toISOString(),
    };
    
    await addTroupe(newTroupe);
    
    Alert.alert('Success!', `You have joined ${newTroupe.name}`);
    
    setInviteCode('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Join a Troupe</Text>
          
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Enter the invite code shared by a friend to join their Troupe.
          </Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
            placeholder="Enter Invite Code"
            placeholderTextColor={theme.textTertiary}
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
          />
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleJoin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Joining...' : 'Join Troupe'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 14,
    padding: 8,
  },
});
