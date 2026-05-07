import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RequestsStackParamList } from '../types';
import HostRequestsScreen from '../screens/requests/HostRequestsScreen';
import PackageDetailScreen from '../screens/home/PackageDetailScreen';

const Stack = createNativeStackNavigator<RequestsStackParamList>();

export default function RequestsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Requests" component={HostRequestsScreen} />
      <Stack.Screen name="RequestPackageDetail" component={PackageDetailScreen as any} />
    </Stack.Navigator>
  );
}
