import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import {
  AuthScreen,
  HomeScreen,
  TroupesScreen,
  ShopScreen,
  ProfileScreen,
  StatsScreen,
  SettingsScreen,
  TroupeDetailScreen,
} from '../screens';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ screenProps }) {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Troupes') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Shop') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: theme.surface,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          color: theme.textPrimary,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home">
        {props => <HomeScreen {...props} {...screenProps} />}
      </Tab.Screen>
      <Tab.Screen name="Troupes">
        {props => <TroupesScreen {...props} {...screenProps} />}
      </Tab.Screen>
      <Tab.Screen name="Shop">
        {props => <ShopScreen {...props} {...screenProps} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {props => <ProfileScreen {...props} {...screenProps} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function HomeStack({ screenProps }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain">
        {props => <HomeScreen {...props} {...screenProps} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function TroupesStack({ screenProps }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: useTheme().theme.surface,
          shadowColor: 'transparent',
        },
        headerTitleStyle: {
          color: useTheme().theme.textPrimary,
        },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="TroupesList">
        {props => <TroupesScreen {...props} {...screenProps} />}
      </Stack.Screen>
      <Stack.Screen
        name="TroupeDetail"
        component={TroupeDetailScreen}
        options={{ title: 'Troupe Details' }}
      />
    </Stack.Navigator>
  );
}

function ShopStack({ screenProps }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShopMain">
        {props => <ShopScreen {...props} {...screenProps} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function ProfileStack({ screenProps }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: useTheme().theme.surface,
          shadowColor: 'transparent',
        },
        headerTitleStyle: {
          color: useTheme().theme.textPrimary,
        },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="ProfileMain">
        {props => <ProfileScreen {...props} {...screenProps} />}
      </Stack.Screen>
      <Stack.Screen
        name="Stats"
        component={StatsScreen}
        options={{ title: 'Statistics' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator({ screenProps }) {
  const { isLoggedIn, isLoading } = useAuth();
  const { theme } = useTheme();
  
  if (isLoading) {
    return null;
  }
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.background },
      }}
    >
      {!isLoggedIn ? (
        <Stack.Screen name="Auth">
          {props => <AuthScreen {...props} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Main">
          {props => <MainTabs {...props} screenProps={screenProps} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
