import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CreatePackageScreen from '../screens/profile/CreatePackageScreen';
import UserProfileScreen from '../screens/home/UserProfileScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="CreatePackage" component={CreatePackageScreen} />
      <Stack.Screen name="PublicUserProfile" component={UserProfileScreen as any} />
    </Stack.Navigator>
  );
}
