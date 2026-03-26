import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Modals
import CreateTroupeModal from './src/screens/CreateTroupeModal';
import JoinTroupeModal from './src/screens/JoinTroupeModal';
import FocusSessionModal from './src/screens/FocusSessionModal';
import FocusSessionScreen from './src/screens/FocusSessionScreen';

function AppContent() {
  const { theme } = useTheme();
  const [activeSession, setActiveSession] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showFocusModal, setShowFocusModal] = useState(false);
  
  // These will be passed to screens
  const screenProps = {
    onCreateTroupe: () => setShowCreateModal(true),
    onJoinTroupe: () => setShowJoinModal(true),
    onStartFocus: () => setShowFocusModal(true),
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
      <NavigationContainer theme={{
        colors: {
          background: theme.background,
          card: theme.surface,
          text: theme.textPrimary,
          border: theme.border,
          primary: theme.primary,
        },
      }}>
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
