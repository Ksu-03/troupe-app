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
import { GEM_PACKAGES, PREMIUM_FEATURES, GEM_EARNING_METHODS } from '../constants/data';

export default function ShopScreen({ onBuyGems, onUpgrade }) {
  const { stats } = useAuth();
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Gems Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>💎 Gems</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          You have {stats.gems} gems
        </Text>
        
        <View style={styles.gemsGrid}>
          {GEM_PACKAGES.map((pkg, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.gemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => onBuyGems(pkg)}
            >
              <Text style={styles.gemEmoji}>💎</Text>
              <Text style={[styles.gemAmount, { color: theme.textPrimary }]}>{pkg.gems + pkg.bonus} Gems</Text>
              {pkg.bonus > 0 && <Text style={[styles.gemBonus, { color: theme.secondary }]}>+{pkg.bonus} bonus</Text>}
              <Text style={[styles.gemPrice, { color: theme.primary }]}>${pkg.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Premium Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>⭐ Premium</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Unlock the full Troupe experience
        </Text>
        
        <TouchableOpacity
          style={[styles.premiumCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={onUpgrade}
        >
          <Text style={[styles.premiumPrice, { color: theme.primary }]}>$3.99</Text>
          <Text style={[styles.premiumPeriod, { color: theme.textSecondary }]}>/month</Text>
          <Text style={[styles.premiumSave, { color: theme.secondary }]}>or $29.99/year (save 37%)</Text>
        </TouchableOpacity>
        
        <View style={styles.featuresGrid}>
          {PREMIUM_FEATURES.map((feature, index) => (
            <View key={index} style={[styles.featureItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>{feature.title}</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* How to Earn Gems Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>How to Earn Gems</Text>
        
        <View style={[styles.earnCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {GEM_EARNING_METHODS.map((method, index) => (
            <View key={index} style={styles.earnRow}>
              <Text style={styles.earnEmoji}>{method.icon}</Text>
              <Text style={[styles.earnText, { color: theme.textPrimary }]}>{method.title}</Text>
              <Text style={[styles.earnAmount, { color: method.color }]}>{method.amount}</Text>
            </View>
          ))}
        </View>
      </View>
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  gemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gemCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
  },
  gemEmoji: {
    fontSize: 32,
  },
  gemAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  gemBonus: {
    fontSize: 10,
  },
  gemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  premiumCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  premiumPrice: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  premiumPeriod: {
    fontSize: 12,
  },
  premiumSave: {
    fontSize: 11,
    marginTop: 4,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    width: '47%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 10,
    textAlign: 'center',
  },
  earnCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  earnEmoji: {
    fontSize: 24,
    width: 40,
  },
  earnText: {
    flex: 1,
    fontSize: 14,
  },
  earnAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});
