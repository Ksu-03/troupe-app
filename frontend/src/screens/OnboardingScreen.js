import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions
} from 'react-native';
import { colors, typography } from '../styles/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    emoji: '🎯',
    title: 'Focus Together',
    description: 'Create private Troupes with friends and focus in real-time'
  },
  {
    id: '2',
    emoji: '💰',
    title: 'The Focus Pot',
    description: 'Contribute gems. Stay focused to earn. Get distracted? You lose them.'
  },
  {
    id: '3',
    emoji: '📱',
    title: 'Active Verification',
    description: 'We detect phone movement and app switching to keep you accountable'
  },
  {
    id: '4',
    emoji: '🏆',
    title: 'Earn Rewards',
    description: 'Unlock achievements, level up your Troupe, and build streaks'
  }
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.dotActive
            ]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 120
  },
  emoji: {
    fontSize: 80,
    marginBottom: 40
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary
  },
  button: {
    backgroundColor: colors.primary,
    marginHorizontal: 24,
    marginBottom: 48,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center'
  },
  buttonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600'
  }
});
