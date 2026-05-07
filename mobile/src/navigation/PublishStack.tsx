import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PublishStackParamList } from '../types';
import DashboardScreen from '../screens/profile/DashboardScreen';
import CreatePackageScreen from '../screens/profile/CreatePackageScreen';
import UserProfileScreen from '../screens/home/UserProfileScreen';

const Stack = createNativeStackNavigator<PublishStackParamList>();

export default function PublishStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen as any}
        initialParams={{ initialTab: 'packages' }}
      />
      <Stack.Screen name="CreatePackage" component={CreatePackageScreen as any} />
      <Stack.Screen name="PublicUserProfile" component={UserProfileScreen as any} />
    </Stack.Navigator>
  );
}
