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
import { WALLET_ADDRESS, WALLET_NETWORK } from '../../config';
import * as Clipboard from 'expo-clipboard';

export default function PurchaseModal({ visible, onClose, item, onSuccess }) {
  const { user, updateStats, updateUser } = useAuth();
  const { theme } = useTheme();
  
  const [showWallet, setShowWallet] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(WALLET_ADDRESS);
    setCopied(true);
    Alert.alert('Copied!', 'Wallet address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = () => {
    Alert.alert(
      'Confirm Payment',
      'Have you sent the exact amount to the wallet address?',
      [
        { text: 'Not yet', style: 'cancel' },
        {
          text: 'Yes, I sent it',
          onPress: () => {
            if (item.type === 'gems') {
              updateStats({ gems: user.stats.gems + item.gems });
              Alert.alert('Success!', `${item.gems} gems added to your account!`);
            } else {
              updateUser({ isPremium: true });
              Alert.alert('Success!', 'Premium activated! Welcome to Troupe Premium!');
            }
            if (onSuccess) onSuccess();
            onClose();
            setShowWallet(false);
          },
        },
      ]
    );
  };

  if (showWallet) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>💰 Send Payment</Text>
            <Text style={[styles.price, { color: theme.primary }]}>${item?.price}</Text>
            
            <View style={[styles.walletCard, { backgroundColor: theme.background }]}>
              <Text style={[styles.walletLabel, { color: theme.textSecondary }]}>Send to:</Text>
              <Text style={[styles.walletAddress, { color: theme.textPrimary }]}>{WALLET_ADDRESS}</Text>
              <Text style={[styles.walletNetwork, { color: theme.textTertiary }]}>Network: {WALLET_NETWORK}</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.copyButton, { backgroundColor: theme.primary + '20' }]}
              onPress={handleCopyAddress}
            >
              <Text style={[styles.copyButtonText, { color: theme.primary }]}>
                {copied ? '✓ Copied!' : '📋 Copy Address'}
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.instruction, { color: theme.textTertiary, marginVertical: 12 }]}>
              Send exactly ${item?.price} USDT on {WALLET_NETWORK} network
            </Text>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleConfirmPayment}
            >
              <Text style={styles.buttonText}>I Sent the Payment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowWallet(false)}>
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
            {item?.type === 'gems' ? '💎 Purchase Gems' : '⭐ Premium Subscription'}
          </Text>
          <Text style={[styles.price, { color: theme.primary }]}>${item?.price}</Text>
          <Text style={[styles.itemName, { color: theme.textSecondary }]}>{item?.name}</Text>
          
          <View style={[styles.paymentMethods, { backgroundColor: theme.background }]}>
            <Text style={[styles.paymentMethodsTitle, { color: theme.textSecondary }]}>Payment Methods:</Text>
            <Text style={[styles.paymentMethod, { color: theme.textTertiary }]}>💳 Credit/Debit Card</Text>
            <Text style={[styles.paymentMethod, { color: theme.textTertiary }]}>₿ USDT ({WALLET_NETWORK})</Text>
            <Text style={[styles.paymentMethod, { color: theme.textTertiary }]}>₿ Bitcoin (BTC)</Text>
            <Text style={[styles.paymentMethod, { color: theme.textTertiary }]}>₿ Ethereum (ETH)</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => setShowWallet(true)}
          >
            <Text style={styles.buttonText}>Continue to Payment</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    marginBottom: 20,
  },
  paymentMethods: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  paymentMethodsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  paymentMethod: {
    fontSize: 11,
    marginVertical: 2,
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
  walletCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 12,
  },
  walletLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  walletAddress: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 4,
  },
  walletNetwork: {
    fontSize: 10,
  },
  copyButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  instruction: {
    fontSize: 11,
    textAlign: 'center',
  },
});
