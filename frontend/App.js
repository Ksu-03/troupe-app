import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

import {
  CreateTroupeModal,
  JoinTroupeModal,
  FocusSessionModal,
  FocusSessionScreen,
  PaymentModal,
  PurchaseModal,
} from './src/screens';

function AppContent() {
  const { theme } = useTheme();
  const [activeSession, setActiveSession] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentItem, setPaymentItem] = useState(null);
  
  // These will be passed to screens via screenProps
  const screenProps = {
    onCreateTroupe: () => setShowCreateModal(true),
    onJoinTroupe: () => setShowJoinModal(true),
    onStartFocus: () => setShowFocusModal(true),
    onBuyGems: (pkg) => {
      setPaymentItem({
        id: `gems_${pkg.gems}`,
        name: `${pkg.gems} Gems`,
        price: pkg.price,
        type: 'gems',
        gems: pkg.gems,
      });
      setShowPaymentModal(true);
    },
    onBuyPremium: () => {
      setPaymentItem({
        id: 'premium_monthly',
        name: 'Premium Subscription',
        price: 3.99,
        type: 'premium',
      });
      setShowPaymentModal(true);
    },
  };
  
  if (activeSession) {
    return (
      <FocusSessionScreen
        session={activeSession}
        onEnd={() => setActiveSession(null)}
        onDistract={() => setActiveSession(null)}
      />
    );
  }
  
  return (
    <>
      <NavigationContainer
        theme={{
          colors: {
            background: theme.background,
            card: theme.surface,
            text: theme.textPrimary,
            border: theme.border,
            primary: theme.primary,
          },
        }}
      >
        <AppNavigator screenProps={screenProps} />
      </NavigationContainer>
      
      <CreateTroupeModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      <JoinTroupeModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
      
      <FocusSessionModal
        visible={showFocusModal}
        onClose={() => setShowFocusModal(false)}
        onStart={(session) => setActiveSession(session)}
      />
      
      <PaymentModal
        visible={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentItem(null);
        }}
        item={paymentItem}
        onSuccess={() => {
          setShowPaymentModal(false);
          setPaymentItem(null);
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
