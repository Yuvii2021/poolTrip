import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Clock, MapPin, Users } from 'lucide-react-native';
import { bookingAPI } from '../../services/api';
import { BookingResponse, RequestsStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { BorderRadius, Spacing, Typography, useTheme } from '../../theme';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import TabBar from '../../components/TabBar';

type Props = {
  navigation: NativeStackNavigationProp<RequestsStackParamList, 'Requests'>;
};

type RequestTab = 'all' | 'pending' | 'confirmed' | 'closed';

export default function HostRequestsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<BookingResponse[]>([]);
  const [activeTab, setActiveTab] = useState<RequestTab>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const openAuth = () => {
    const parentNav = navigation.getParent() as any;
    parentNav?.navigate('Auth', {
      screen: 'Login',
      params: { redirect: 'RequestsTab' },
    });
  };

  const loadRequests = useCallback(async () => {
    if (!isAuthenticated) {
      setRequests([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await bookingAPI.getHostBookings();
      setRequests(data);
    } catch {
      // no-op
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (bookingId: number) => {
    setProcessingId(bookingId);
    try {
      await bookingAPI.approveBooking(bookingId);
      await loadRequests();
    } catch {
      Alert.alert('Error', 'Failed to approve booking request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId: number) => {
    Alert.alert('Reject request', 'Are you sure you want to reject this booking?', [
      { text: 'No' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setProcessingId(bookingId);
          try {
            await bookingAPI.rejectBooking(bookingId);
            await loadRequests();
          } catch {
            Alert.alert('Error', 'Failed to reject booking request.');
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };

  const filteredRequests = requests.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return item.status === 'PENDING';
    if (activeTab === 'confirmed') return item.status === 'CONFIRMED';
    return item.status === 'REJECTED' || item.status === 'CANCELLED';
  });

  const tabs = [
    { key: 'pending', label: 'Pending', count: requests.filter((i) => i.status === 'PENDING').length },
    { key: 'confirmed', label: 'Confirmed', count: requests.filter((i) => i.status === 'CONFIRMED').length },
    { key: 'closed', label: 'Closed', count: requests.filter((i) => i.status === 'REJECTED' || i.status === 'CANCELLED').length },
    { key: 'all', label: 'All', count: requests.length },
  ];

  if (loading) return <LoadingSpinner message="Loading requests..." />;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
        <View style={styles.titleBar}>
          <Text style={[Typography.headlineLg, { color: colors.onSurface }]}>Requests</Text>
        </View>
        <View style={styles.authWrap}>
          <EmptyState icon="inbox" title="Sign in to manage requests" subtitle="Approve or reject booking requests from travelers." />
          <Button title="Sign In" onPress={openAuth} style={{ marginTop: Spacing.xl }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <View style={styles.titleBar}>
        <Text style={[Typography.headlineLg, { color: colors.onSurface }]}>Booking Requests</Text>
      </View>

      <TabBar tabs={tabs} activeKey={activeTab} onTabPress={(k) => setActiveTab(k as RequestTab)} style={{ paddingHorizontal: Spacing['2xl'] }} />

      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRequests(); }} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="inbox" title="No requests" subtitle="New requests will appear here." />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const statusVariant = item.status === 'CONFIRMED' ? 'confirmed' : item.status === 'PENDING' ? 'pending' : item.status === 'REJECTED' ? 'rejected' : 'cancelled';
          const statusLabel = item.status === 'CONFIRMED' ? 'Confirmed' : item.status === 'PENDING' ? 'Pending' : item.status === 'REJECTED' ? 'Rejected' : 'Cancelled';
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('RequestPackageDetail', { packageId: item.packageId })}
              style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderRadius: BorderRadius.xl }]}
            >
              <View style={styles.headerRow}>
                <Avatar name={item.passengerName} uri={item.passengerPhoto} size={38} />
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={[Typography.titleSm, { color: colors.onSurface }]} numberOfLines={1}>{item.passengerName}</Text>
                  <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant }]}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                </View>
                <Badge variant="status" status={statusVariant as any}>{statusLabel}</Badge>
              </View>

              <View style={styles.metaRow}>
                <MapPin size={14} color={colors.onSurfaceVariant} />
                <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginLeft: 6, flex: 1 }]} numberOfLines={1}>
                  {item.packageTitle}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Users size={14} color={colors.onSurfaceVariant} />
                <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginLeft: 6 }]}>
                  {item.seatsBooked} seat(s)
                </Text>
                <Clock size={14} color={colors.onSurfaceVariant} style={{ marginLeft: Spacing.md }} />
                <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginLeft: 6 }]}>
                  {item.status === 'PENDING' ? 'Needs action' : 'Handled'}
                </Text>
              </View>

              {item.message ? (
                <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginTop: Spacing.sm }]} numberOfLines={2}>
                  "{item.message}"
                </Text>
              ) : null}

              {item.status === 'PENDING' && (
                <View style={styles.actions}>
                  <Button
                    title="Approve"
                    size="sm"
                    onPress={() => handleApprove(item.id)}
                    loading={processingId === item.id}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Reject"
                    variant="danger"
                    size="sm"
                    onPress={() => handleReject(item.id)}
                    disabled={processingId === item.id}
                    style={{ flex: 1 }}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  titleBar: { paddingHorizontal: Spacing['2xl'], paddingTop: Spacing['2xl'], paddingBottom: Spacing.lg },
  authWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing['2xl'] },
  listContent: { paddingHorizontal: Spacing['2xl'], paddingBottom: Spacing['4xl'], paddingTop: Spacing.lg },
  card: { padding: Spacing.lg, marginBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
});
