import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { TROUPE_ICONS, COLOR_OPTIONS } from '../constants/data';

export default function CreateTroupeModal({ visible, onClose }) {
  const { user, addTroupe } = useAuth();
  const { theme } = useTheme();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Troupe name is required');
      return;
    }
    
    setLoading(true);
    
    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newTroupe = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      icon: TROUPE_ICONS[selectedIcon],
      color: COLOR_OPTIONS[selectedColor],
      level: 1,
      totalMinutes: 0,
      memberCount: 1,
      inviteCode: inviteCode,
      members: [{ id: user.id, username: user.username, role: 'admin' }],
      createdAt: new Date().toISOString(),
    };
    
    await addTroupe(newTroupe);
    
    Alert.alert('Troupe Created!', `Invite code: ${inviteCode}\n\nShare this code with friends to join!`);
    
    // Reset form and close
    setName('');
    setDescription('');
    setSelectedIcon(0);
    setSelectedColor(0);
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
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Create Troupe</Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
            placeholder="Troupe Name *"
            placeholderTextColor={theme.textTertiary}
            value={name}
            onChangeText={setName}
          />
          
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
            placeholder="Description (optional)"
            placeholderTextColor={theme.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          
          <Text style={[styles.label, { color: theme.textSecondary }]}>Choose Icon</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
            {TROUPE_ICONS.map((icon, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.iconOption,
                  { backgroundColor: theme.background, borderColor: theme.border },
                  selectedIcon === index && { borderColor: COLOR_OPTIONS[selectedColor], borderWidth: 2 }
                ]}
                onPress={() => setSelectedIcon(index)}
              >
                <Text style={styles.iconEmoji}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Text style={[styles.label, { color: theme.textSecondary }]}>Choose Color</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === index && styles.colorSelected
                ]}
                onPress={() => setSelectedColor(index)}
              />
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Troupe'}</Text>
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
    maxHeight: '80%',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 8,
  },
  iconScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  iconEmoji: {
    fontSize: 28,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
    justifyContent: 'center',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  button: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 14,
    padding: 12,
    marginTop: 8,
  },
});
