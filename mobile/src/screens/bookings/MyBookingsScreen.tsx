import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, MapPin, Users, Star, MessageCircle } from 'lucide-react-native';
import { BookingsStackParamList, BookingResponse, BookingStatus } from '../../types';
import { bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';
import TabBar from '../../components/TabBar';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

type Props = { navigation: NativeStackNavigationProp<BookingsStackParamList, 'MyBookings'> };

const statusMap: Record<string, 'confirmed' | 'pending' | 'rejected' | 'cancelled'> = {
  CONFIRMED: 'confirmed', PENDING: 'pending', REJECTED: 'rejected', CANCELLED: 'cancelled',
};

export default function MyBookingsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [ratingId, setRatingId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);

  const openAuth = () => {
    const parentNav = navigation.getParent() as any;
    parentNav?.navigate('Auth', {
      screen: 'Login',
      params: { redirect: 'BookingsTab' },
    });
  };

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setBookings([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await bookingAPI.getMyBookings();
      setBookings(data);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, [isAuthenticated]);

  useEffect(() => { load(); }, [load]);

  const filtered = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'past') return b.status === 'REJECTED' || b.status === 'CANCELLED';
    return b.status === activeTab.toUpperCase();
  });

  const tabs = [
    { key: 'all', label: 'All', count: bookings.length },
    { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'CONFIRMED').length },
    { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'PENDING').length },
    { key: 'past', label: 'Past', count: bookings.filter(b => b.status === 'REJECTED' || b.status === 'CANCELLED').length },
  ];

  const handleCancel = (id: number) => {
    Alert.alert('Cancel Booking', 'Are you sure?', [
      { text: 'No' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try { await bookingAPI.cancelBooking(id); load(); } catch { Alert.alert('Error', 'Failed to cancel'); }
      }},
    ]);
  };

  const handleRate = async (bookingId: number) => {
    if (rating === 0) return;
    try {
      await bookingAPI.rateBooking(bookingId, rating);
      setRatingId(null); setRating(0);
      Alert.alert('Thanks!', 'Your rating has been submitted.');
      load();
    } catch { Alert.alert('Error', 'Failed to submit rating'); }
  };

  const renderBooking = ({ item }: { item: BookingResponse }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderRadius: BorderRadius.xl }]}
      onPress={() => navigation.navigate('BookingPackageDetail', { packageId: item.packageId })}
      activeOpacity={0.7}
    >
      {/* Image */}
      {item.packageImage ? (
        <Image source={{ uri: item.packageImage }} style={[styles.cardImg, { borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl }]} />
      ) : (
        <View style={[styles.cardImgPlaceholder, { backgroundColor: colors.surfaceContainerHigh, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl }]}>
          <MapPin size={32} color={colors.onSurfaceVariant} />
        </View>
      )}

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={[Typography.titleMd, { color: colors.onSurface, flex: 1 }]} numberOfLines={1}>{item.packageTitle}</Text>
          <Badge variant="status" status={statusMap[item.status]}>
            {item.status === 'CONFIRMED' ? 'Confirmed' : item.status === 'PENDING' ? 'Pending' : item.status === 'REJECTED' ? 'Rejected' : 'Cancelled'}
          </Badge>
        </View>

        <View style={styles.metaRow}>
          <MapPin size={14} color={colors.onSurfaceVariant} />
          <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>
            {item.packageOrigin ? `${item.packageOrigin} → ` : ''}{item.packageDestination}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Calendar size={14} color={colors.onSurfaceVariant} />
          <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>
            {item.packageStartDate ? new Date(item.packageStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
          </Text>
          <Users size={14} color={colors.onSurfaceVariant} style={{ marginLeft: Spacing.lg }} />
          <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>{item.seatsBooked} seat(s)</Text>
        </View>

        {/* Host info */}
        <View style={[styles.hostRow, { borderTopColor: colors.outlineVariant }]}>
          <Avatar name={item.hostName} uri={item.hostPhoto} size={32} />
          <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginLeft: Spacing.sm, flex: 1 }]}>Hosted by {item.hostName}</Text>
          {item.hostWhatsapp && (
            <TouchableOpacity onPress={() => { const { Linking } = require('react-native'); Linking.openURL(`https://wa.me/${item.hostWhatsapp}`); }}>
              <MessageCircle size={20} color="#25d366" />
            </TouchableOpacity>
          )}
        </View>

        {/* Actions */}
        {(item.status === 'PENDING' || item.status === 'CONFIRMED') && (
          <Button title="Cancel Booking" variant="danger" size="sm" onPress={() => handleCancel(item.id)} fullWidth style={{ marginTop: Spacing.md }} />
        )}

        {item.status === 'CONFIRMED' && ratingId !== item.id && (
          <Button title="Rate Trip" variant="secondary" size="sm" onPress={() => { setRatingId(item.id); setRating(0); }} fullWidth style={{ marginTop: Spacing.md }} />
        )}

        {ratingId === item.id && (
          <View style={styles.ratingSection}>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Star size={28} color="#f59e0b" fill={s <= rating ? '#f59e0b' : 'transparent'} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.ratingActions}>
              <Button title="Submit" size="sm" onPress={() => handleRate(item.id)} />
              <Button title="Cancel" variant="ghost" size="sm" onPress={() => setRatingId(null)} />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) return <LoadingSpinner message="Loading bookings..." />;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
        <View style={styles.titleBar}>
          <Text style={[Typography.headlineLg, { color: colors.onSurface }]}>My Bookings</Text>
        </View>
        <View style={styles.guestPrompt}>
          <EmptyState icon="calendar" title="Sign in to view bookings" subtitle="You only need to log in when booking a trip." />
          <Button
            title="Sign In"
            onPress={openAuth}
            style={{ marginTop: Spacing.xl }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <View style={styles.titleBar}>
        <Text style={[Typography.headlineLg, { color: colors.onSurface }]}>My Bookings</Text>
      </View>
      <TabBar tabs={tabs} activeKey={activeTab} onTabPress={setActiveTab} style={{ paddingHorizontal: Spacing['2xl'] }} />
      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
        renderItem={renderBooking}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="calendar" title="No bookings" subtitle="Your booked trips will appear here" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  titleBar: { paddingHorizontal: Spacing['2xl'], paddingTop: Spacing['2xl'], paddingBottom: Spacing.lg },
  guestPrompt: { flex: 1, paddingHorizontal: Spacing['2xl'], justifyContent: 'center' },
  listContent: { paddingHorizontal: Spacing['2xl'], paddingBottom: Spacing['4xl'], paddingTop: Spacing.lg },
  card: { marginBottom: Spacing.xl, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  cardImg: { width: '100%', height: 160 },
  cardImgPlaceholder: { width: '100%', height: 120, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: Spacing.lg },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  hostRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: 1 },
  ratingSection: { marginTop: Spacing.md },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm },
  ratingActions: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, marginTop: Spacing.md },
});
