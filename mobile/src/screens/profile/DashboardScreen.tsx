import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Package, Users, Clock, CheckCircle } from 'lucide-react-native';
import { PublishStackParamList, TravelPackage, BookingResponse } from '../../types';
import { packageAPI, bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';
import TabBar from '../../components/TabBar';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

type Props = {
  navigation: NativeStackNavigationProp<PublishStackParamList, 'Dashboard'>;
  route: { params?: { initialTab?: 'overview' | 'packages' | 'requests' } };
};

export default function DashboardScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();

  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [pendingBookings, setPendingBookings] = useState<BookingResponse[]>([]);
  const [allHostBookings, setAllHostBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'overview');

  const openAuth = () => {
    const parentNav = navigation.getParent() as any;
    parentNav?.navigate('Auth', {
      screen: 'Login',
      params: { redirect: 'PublishTab' },
    });
  };

  const load = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setPackages([]);
      setPendingBookings([]);
      setAllHostBookings([]);
      setLoading(false);
      return;
    }
    try {
      const [pkgs, pending, hostBookings] = await Promise.all([
        packageAPI.getPackagesByUserId(user.id),
        bookingAPI.getPendingHostBookings(),
        bookingAPI.getHostBookings(),
      ]);
      setPackages(pkgs);
      setPendingBookings(pending);
      setAllHostBookings(hostBookings);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, [user?.id, isAuthenticated]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: number) => {
    try { await bookingAPI.approveBooking(id); load(); } catch { Alert.alert('Error', 'Failed to approve'); }
  };
  const handleReject = async (id: number) => {
    Alert.alert('Reject Booking', 'Are you sure?', [
      { text: 'No' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try { await bookingAPI.rejectBooking(id); load(); } catch { Alert.alert('Error', 'Failed to reject'); }
      }},
    ]);
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'packages', label: 'Packages', count: packages.length },
    { key: 'requests', label: 'Requests', count: pendingBookings.length },
  ];

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
        <View style={styles.titleBar}>
          <Text style={[Typography.headlineLg, { color: colors.onSurface }]}>Publishing</Text>
        </View>
        <View style={styles.authRequiredWrap}>
          <EmptyState icon="package" title="Sign in to publish trips" subtitle="You only need login for creating or managing your own trips." />
          <Button
            title="Sign In"
            onPress={openAuth}
            style={{ marginTop: Spacing.xl }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const totalSeats = packages.reduce((a, p) => a + p.totalSeats, 0);
  const bookedSeats = packages.reduce((a, p) => a + (p.totalSeats - p.availableSeats), 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <View style={styles.titleBar}>
        <Text style={[Typography.headlineLg, { color: colors.onSurface }]}>Dashboard</Text>
        <Button title="+ New Trip" size="sm" onPress={() => navigation.navigate('CreatePackage', {})} />
      </View>

      <TabBar tabs={tabs} activeKey={activeTab} onTabPress={(key) => setActiveTab(key as 'overview' | 'packages' | 'requests')} style={{ paddingHorizontal: Spacing['2xl'] }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
      >
        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <View style={styles.statsGrid}>
              {[
                { label: 'Packages', value: packages.length, icon: <Package size={20} color={colors.primary} /> },
                { label: 'Total Seats', value: totalSeats, icon: <Users size={20} color={colors.primary} /> },
                { label: 'Booked', value: bookedSeats, icon: <CheckCircle size={20} color={colors.success} /> },
                { label: 'Pending', value: pendingBookings.length, icon: <Clock size={20} color="#f59e0b" /> },
              ].map(stat => (
                <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.surfaceContainerLow, borderRadius: BorderRadius.xl }]}>
                  {stat.icon}
                  <Text style={[Typography.headlineMd, { color: colors.onSurface, marginTop: Spacing.sm }]}>{stat.value}</Text>
                  <Text style={[Typography.labelSm, { color: colors.onSurfaceVariant }]}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Recent requests */}
            {pendingBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={[Typography.titleLg, { color: colors.onSurface }]}>Pending Requests</Text>
                {pendingBookings.slice(0, 3).map(b => renderBookingRequest(b, colors, handleApprove, handleReject))}
              </View>
            )}
          </>
        )}

        {activeTab === 'packages' && (
          <View>
            {packages.length === 0 ? (
              <EmptyState icon="package" title="No packages yet" subtitle="Create your first trip package" />
            ) : packages.map(pkg => (
              <TouchableOpacity
                key={pkg.id}
                style={[styles.pkgCard, { backgroundColor: colors.surfaceContainerLowest, borderRadius: BorderRadius.xl }]}
                onPress={() => navigation.navigate('CreatePackage', { packageId: pkg.id })}
              >
                <View style={styles.pkgRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.titleMd, { color: colors.onSurface }]} numberOfLines={1}>{pkg.title}</Text>
                    <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant }]}>{pkg.destination}</Text>
                  </View>
              <Badge variant="status" status={pkg.status === 'ACTIVE' ? 'confirmed' : pkg.status === 'SOLDOUT' ? 'pending' : 'cancelled'}>{pkg.status}</Badge>
                </View>
                <View style={[styles.pkgMeta, { borderTopColor: colors.outlineVariant }]}>
                  <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant }]}>₹{pkg.price.toLocaleString()}</Text>
                  <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant }]}>{pkg.availableSeats}/{pkg.totalSeats} seats</Text>
                  <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant }]}>{pkg.durationDays}D</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'requests' && (
          <View>
            {allHostBookings.length === 0 ? (
              <EmptyState icon="inbox" title="No booking requests yet" subtitle="Booking updates for your trips will appear here." />
            ) : allHostBookings.map(b => renderBookingRequest(b, colors, handleApprove, handleReject))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function renderBookingRequest(
  b: BookingResponse,
  colors: any,
  onApprove: (id: number) => void,
  onReject: (id: number) => void,
) {
  const statusLabel = b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'PENDING' ? 'Pending' : b.status === 'REJECTED' ? 'Rejected' : 'Cancelled';
  const statusVariant = b.status === 'CONFIRMED' ? 'confirmed' : b.status === 'PENDING' ? 'pending' : b.status === 'REJECTED' ? 'rejected' : 'cancelled';

  return (
    <View key={b.id} style={[styles.requestCard, { backgroundColor: colors.surfaceContainerLowest, borderRadius: BorderRadius.xl }]}>
      <View style={styles.requestHeader}>
        <Avatar name={b.passengerName} uri={b.passengerPhoto} size={36} />
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <Text style={[Typography.titleSm, { color: colors.onSurface }]}>{b.passengerName}</Text>
          <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant }]}>{b.seatsBooked} seat(s) · {b.packageTitle}</Text>
        </View>
        <Badge variant="status" status={statusVariant as any}>{statusLabel}</Badge>
      </View>
      {b.message && <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginTop: Spacing.sm }]}>"{b.message}"</Text>}
      {b.status === 'PENDING' && (
        <View style={styles.requestActions}>
          <Button title="Approve" size="sm" onPress={() => onApprove(b.id)} style={{ flex: 1 }} />
          <Button title="Reject" variant="danger" size="sm" onPress={() => onReject(b.id)} style={{ flex: 1 }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  titleBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing['2xl'], paddingTop: Spacing['2xl'], paddingBottom: Spacing.lg },
  authRequiredWrap: { flex: 1, paddingHorizontal: Spacing['2xl'], justifyContent: 'center' },
  scrollContent: { paddingHorizontal: Spacing['2xl'], paddingBottom: Spacing['4xl'], paddingTop: Spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  statCard: { width: '47%', padding: Spacing.lg, alignItems: 'center' },
  section: { marginTop: Spacing['2xl'] },
  pkgCard: { padding: Spacing.lg, marginBottom: Spacing.md, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  pkgRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pkgMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1 },
  requestCard: { padding: Spacing.lg, marginTop: Spacing.md, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  requestHeader: { flexDirection: 'row', alignItems: 'center' },
  requestActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
});
