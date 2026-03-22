import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { WebView } from 'react-native-webview';
import api from '../services/api';
import { colors } from '../styles/theme';

export default function PaymentScreen({ route, navigation }) {
  const { productId } = route.params;
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  useEffect(() => {
    createPayment();
  }, []);

  async function createPayment() {
    try {
      const response = await api.post('/payments/create', { productId });
      setCheckoutUrl(response.data.checkoutUrl);
      setPaymentId(response.data.paymentId);
      startPolling(response.data.paymentId);
    } catch (error) {
      console.error('Create payment error:', error);
      Alert.alert('Error', 'Failed to create payment', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function startPolling(paymentId) {
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/payments/status/${paymentId}`);
        if (response.data.status === 'completed') {
          clearInterval(interval);
          Alert.alert('Success!', 'Payment completed successfully!', [
            { text: 'OK', onPress: () => navigation.navigate('Home') }
          ]);
        } else if (response.data.status === 'failed') {
          clearInterval(interval);
          Alert.alert('Payment Failed', 'Your payment could not be processed', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 3600000);
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Preparing checkout...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: checkoutUrl }}
        style={styles.webview}
        onError={() => {
          Alert.alert('Error', 'Failed to load payment page');
          navigation.goBack();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  webview: {
    flex: 1
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary
  }
});
