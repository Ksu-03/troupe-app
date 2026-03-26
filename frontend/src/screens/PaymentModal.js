import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../../config';

export default function PaymentModal({ visible, onClose, item, onSuccess }) {
  const { user, updateStats, updateUser } = useAuth();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  const createPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          productId: item.id,
          productName: item.name,
          amount: item.price,
          type: item.type,
          gems: item.gems,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl);
        setPaymentId(data.paymentId);
        startPolling(data.paymentId);
      } else {
        Alert.alert('Error', data.error || 'Failed to create payment');
        onClose();
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (paymentId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/payments/status/${paymentId}`);
        const data = await response.json();
        
        if (data.status === 'finished') {
          clearInterval(interval);
          setPollingInterval(null);
          
          // Payment successful
          if (item.type === 'gems') {
            await updateStats({ gems: user.stats.gems + item.gems });
            Alert.alert('Success!', `${item.gems} gems added to your account!`);
          } else {
            await updateUser({ isPremium: true });
            Alert.alert('Success!', 'Premium activated! Welcome to Troupe Premium!');
          }
          
          if (onSuccess) onSuccess();
          onClose();
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setPollingInterval(null);
          Alert.alert('Payment Failed', 'Your payment could not be processed. Please try again.');
          onClose();
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
    
    setPollingInterval(interval);
    
    // Stop polling after 10 minutes
    setTimeout(() => {
      if (interval) clearInterval(interval);
      setPollingInterval(null);
    }, 600000);
  };

  useEffect(() => {
    if (visible && item) {
      createPayment();
    }
    
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [visible, item]);

  const handleOpenCheckout = () => {
    if (checkoutUrl) {
      Linking.openURL(checkoutUrl);
      Alert.alert(
        'Payment Page Opened',
        'Complete your payment in the browser.\n\nAccepted payment methods:\n💳 Credit/Debit Card\n₿ USDT (Arbitrum)\n₿ Bitcoin\n₿ Ethereum\n\nThe app will automatically detect when payment is complete.',
        [{ text: 'OK' }]
      );
    }
  };

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary, marginTop: 16 }]}>
              Creating payment...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Complete Payment</Text>
          <Text style={[styles.price, { color: theme.primary }]}>${item?.price}</Text>
          <Text style={[styles.itemName, { color: theme.textSecondary }]}>{item?.name}</Text>
          
          <View style={[styles.paymentMethods, { backgroundColor: theme.background }]}>
            <Text style={[styles.paymentMethodsTitle, { color: theme.textSecondary }]}>Accepted payment methods:</Text>
            <Text style={[styles.paymentMethod, { color: theme.textTertiary }]}>💳 Credit/Debit Card (Visa, Mastercard)</Text>
            <Text style={[styles.paymentMethod, { color: theme.textTertiary }]}>₿ USDT (Arbitrum network)</Text>
            <Text style={[styles.paymentMethod, { color: theme.textTertiary }]}>₿ Bitcoin (BTC)</Text>
            <Text style={[styles.paymentMethod, { color: theme.textTertiary }]}>₿ Ethereum (ETH)</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleOpenCheckout}
          >
            <Text style={styles.buttonText}>Pay ${item?.price}</Text>
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
  loadingText: {
    fontSize: 14,
  },
});
