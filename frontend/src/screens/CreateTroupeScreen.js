import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { colors, typography } from '../styles/theme';

export default function CreateTroupeScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [crestEmoji, setCrestEmoji] = useState('🎯');
  const [loading, setLoading] = useState(false);

  const EMOJIS = ['🎯', '🚀', '💪', '🌟', '🔥', '🎭', '📚', '🧘', '⚡', '🏆'];

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert('Error', 'Troupe name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/troupes', {
        name: name.trim(),
        description: description.trim(),
        crestEmoji,
        isPrivate: true
      });
      navigation.replace('Troupe', { troupeId: response.data.troupe.id });
    } catch (error) {
      Alert.alert('Error', 'Failed to create troupe');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Troupe Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Focus Friends"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="What's your Troupe about?"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Choose Crest Emoji</Text>
      <View style={styles.emojiGrid}>
        {EMOJIS.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={[styles.emojiOption, crestEmoji === emoji && styles.emojiSelected]}
            onPress={() => setCrestEmoji(emoji)}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Create Troupe</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  label: { ...typography.body, fontWeight: '600', color: colors.textPrimary, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, ...typography.body, color: colors.textPrimary },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  emojiOption: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  emojiSelected: { borderColor: colors.primary, borderWidth: 3 },
  emojiText: { fontSize: 28 },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  buttonText: { ...typography.body, color: '#FFFFFF', fontWeight: '600' }
});
