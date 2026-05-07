import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookOpen, User, CirclePlus, Inbox } from 'lucide-react-native';
import { MainTabParamList } from '../types';
import { useTheme } from '../theme';
import HomeStack from './HomeStack';
import BookingsStack from './BookingsStack';
import ProfileStack from './ProfileStack';
import PublishStack from './PublishStack';
import RequestsStack from './RequestsStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const { colors, shadows } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 22 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 92 : 68,
          ...shadows.md,
        },
        tabBarLabelStyle: {
          fontFamily: 'Manrope_600SemiBold',
          fontSize: 11,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsStack}
        options={{
          tabBarLabel: 'Trips',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="PublishTab"
        component={PublishStack}
        options={{
          tabBarLabel: 'Publish',
          tabBarIcon: ({ color, size }) => <CirclePlus size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="RequestsTab"
        component={RequestsStack}
        options={{
          tabBarLabel: 'Requests',
          tabBarIcon: ({ color, size }) => <Inbox size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
