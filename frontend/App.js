import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Screens
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import HomeScreen from './src/screens/Home/HomeScreen';
import TroupesScreen from './src/screens/Troupes/TroupesScreen';
import TroupeDetailScreen from './src/screens/Troupes/TroupeDetailScreen';
import CreateTroupeScreen from './src/screens/Troupes/CreateTroupeScreen';
import FocusSessionScreen from './src/screens/Focus/FocusSessionScreen';
import ShopScreen from './src/screens/Shop/ShopScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import Loading from './src/components/common/Loading';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleStyle: {
          color: theme.textPrimary,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarIcon: '🏠' }}
      />
      <Tab.Screen 
        name="Troupes" 
        component={TroupesStack} 
        options={{ tabBarIcon: '🎭', headerShown: false }}
      />
      <Tab.Screen 
        name="Shop" 
        component={ShopScreen} 
        options={{ tabBarIcon: '🛍️' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarIcon: '👤' }}
      />
    </Tab.Navigator>
  );
}

function TroupesStack() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleStyle: {
          color: theme.textPrimary,
        },
        headerTintColor: theme.primary,
      }}
    >
      <Stack.Screen name="TroupesList" component={TroupesScreen} options={{ title: 'My Troupes' }} />
      <Stack.Screen name="TroupeDetail" component={TroupeDetailScreen} options={{ title: 'Troupe Details' }} />
      <Stack.Screen name="CreateTroupe" component={CreateTroupeScreen} options={{ title: 'Create Troupe' }} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return <Loading />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.background },
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen 
            name="FocusSession" 
            component={FocusSessionScreen} 
            options={{ headerShown: true, title: 'Focus Session' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}
