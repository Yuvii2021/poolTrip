import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BookingsStackParamList } from '../types';
import MyBookingsScreen from '../screens/bookings/MyBookingsScreen';
import PackageDetailScreen from '../screens/home/PackageDetailScreen';

const Stack = createNativeStackNavigator<BookingsStackParamList>();

export default function BookingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      <Stack.Screen name="BookingPackageDetail" component={PackageDetailScreen as any} />
    </Stack.Navigator>
  );
}
