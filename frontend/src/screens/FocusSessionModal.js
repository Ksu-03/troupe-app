import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function FocusSessionModal({ visible, onClose }) {
  const { stats, updateStats } = useAuth();
  const { theme } = useTheme();
  
  const [duration, setDuration] = useState(25);
  const [contribution, setContribution] = useState(10);
  const [loading, setLoading] = useState(false);
  
  const durations = [15, 25, 45, 60];
  const contributions = [5, 10, 20, 50];

  const handleStart = async () => {
    if (stats.gems < contribution) {
      Alert.alert('Not Enough Gems', `You need ${contribution} gems to start a session. Earn gems by completing sessions!`);
      return;
    }
    
    setLoading(true);
    
    // Deduct gems
    await updateStats({ ...stats, gems: stats.gems - contribution });
    
    setLoading(false);
    onClose();
    
    // Start session (this will be handled by the main app)
    // We'll pass this via callback
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
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Focus Session</Text>
          
          <Text style={[styles.label, { color: theme.textSecondary }]}>Duration</Text>
          <View style={styles.optionsRow}>
            {durations.map(d => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.option,
                  { backgroundColor: theme.background, borderColor: theme.border },
                  duration === d && { backgroundColor: theme.primary }
                ]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.optionText, duration === d && { color: '#FFFFFF' }]}>{d} min</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>Gems to Contribute</Text>
          <View style={styles.optionsRow}>
            {contributions.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.option,
                  { backgroundColor: theme.background, borderColor: theme.border },
                  contribution === c && { backgroundColor: theme.primary }
                ]}
                onPress={() => setContribution(c)}
              >
                <Text style={[styles.optionText, contribution === c && { color: '#FFFFFF' }]}>{c} 💎</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={[styles.gemsInfo, { color: theme.textTertiary }]}>
            You have {stats.gems} gems
          </Text>
          
          <View style={[styles.infoBox, { backgroundColor: theme.background }]}>
            <Text style={[styles.infoTitle, { color: theme.textSecondary }]}>💡 How it works:</Text>
            <Text style={[styles.infoText, { color: theme.textTertiary }]}>• Everyone contributes gems to the pot</Text>
            <Text style={[styles.infoText, { color: theme.textTertiary }]}>• Stay focused to earn from the pot</Text>
            <Text style={[styles.infoText, { color: theme.textTertiary }]}>• Get distracted? Your gems go to others!</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleStart}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Starting...' : 'Start Session'}</Text>
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
  label: {
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
  },
  gemsInfo: {
    fontSize: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  infoBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 8,
    marginBottom: 4,
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
