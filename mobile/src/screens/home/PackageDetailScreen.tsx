import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MapPin, Calendar, Users, Clock, Star, Phone, MessageCircle, ArrowLeft, Minus, Plus, Check, X } from 'lucide-react-native';
import { HomeStackParamList, TravelPackage, BookingResponse } from '../../types';
import { packageAPI, bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';
import ImageCarousel from '../../components/ImageCarousel';
import TabBar from '../../components/TabBar';
import Badge from '../../components/Badge';
import SeatProgressBar from '../../components/SeatProgressBar';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'PackageDetail'>;
  route: RouteProp<HomeStackParamList, 'PackageDetail'>;
};

const parseList = (data: string | string[] | undefined): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try { const p = JSON.parse(data); if (Array.isArray(p)) return p.map((i: any) => typeof i === 'object' ? `${i.title || ''}: ${i.description || ''}`.trim() : i); } catch {}
    return data.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

export default function PackageDetailScreen({ navigation, route }: Props) {
  const { packageId } = route.params;
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();

  const [pkg, setPkg] = useState<TravelPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [seats, setSeats] = useState(1);
  const [bookingMsg, setBookingMsg] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [existingBooking, setExistingBooking] = useState<BookingResponse | null>(null);

  const openAuth = () => {
    const parentNav = navigation.getParent() as any;
    parentNav?.navigate('Auth', {
      screen: 'Login',
      params: { redirect: 'BookingsTab' },
    });
  };

  const loadPackage = useCallback(async () => {
    try {
      const data = await packageAPI.getPackageById(packageId);
      setPkg(data);
    } catch { Alert.alert('Error', 'Failed to load package'); }
    finally { setLoading(false); }
  }, [packageId]);

  useEffect(() => { loadPackage(); }, [loadPackage]);

  useEffect(() => {
    if (pkg && isAuthenticated) {
      bookingAPI.getBookingStatus(pkg.id).then(setExistingBooking).catch(() => setExistingBooking(null));
    }
  }, [pkg?.id, isAuthenticated]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      openAuth();
      return;
    }
    if (!pkg) return;
    setBookingLoading(true);
    try {
      const res = await bookingAPI.createBooking({ packageId: pkg.id, seats, message: bookingMsg || undefined });
      setExistingBooking(res);
      Alert.alert('Booked!', `${seats} seat(s) booked successfully.`);
      loadPackage();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Booking failed');
    } finally { setBookingLoading(false); }
  };

  const handleCancel = async () => {
    if (!existingBooking) return;
    Alert.alert('Cancel Booking', 'Are you sure?', [
      { text: 'No' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try {
          await bookingAPI.cancelBooking(existingBooking.id);
          setExistingBooking(null);
          loadPackage();
        } catch { Alert.alert('Error', 'Failed to cancel'); }
      }},
    ]);
  };

  if (loading || !pkg) return <LoadingSpinner message="Loading..." />;

  const hasDiscount = pkg.discountedPrice && pkg.discountedPrice < pkg.price;
  const displayPrice = hasDiscount ? pkg.discountedPrice! : pkg.price;
  const media = Array.isArray(pkg.media) ? pkg.media.filter(u => u?.startsWith('http')) : [];
  const inclusions = parseList(pkg.inclusions);
  const exclusions = parseList(pkg.exclusions);
  const itinerary = parseList(pkg.itinerary);
  const isOwn = user && user.id === pkg.userId;
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'itinerary', label: 'Itinerary', count: itinerary.length || undefined },
    { key: 'terms', label: 'Terms' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.heroContainer}>
          {media.length > 0 ? (
            <ImageCarousel images={media} height={320} />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: colors.surfaceContainerHigh }]}>
              <MapPin size={48} color={colors.onSurfaceVariant} />
            </View>
          )}
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface + 'CC' }]} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color={colors.onSurface} />
          </TouchableOpacity>
          {/* Badges */}
          <View style={styles.heroBadges}>
            <Badge>{`${pkg.durationDays}D${pkg.durationNights ? `/${pkg.durationNights}N` : ''}`}</Badge>
            {hasDiscount && <Badge variant="status" status="confirmed">{`${Math.round(((pkg.price - pkg.discountedPrice!) / pkg.price) * 100)}% OFF`}</Badge>}
          </View>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={[Typography.headlineLg, { color: colors.onSurface }]}>{pkg.title}</Text>
          <View style={styles.metaRow}>
            <MapPin size={16} color={colors.onSurfaceVariant} />
            <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>
              {pkg.origin ? `${pkg.origin} → ` : ''}{pkg.destination}
            </Text>
          </View>

          {/* Host card */}
          {pkg.postedByName && (
            <TouchableOpacity
              style={[styles.hostCard, { backgroundColor: colors.surfaceContainerLow, borderRadius: BorderRadius.xl }]}
              onPress={() => navigation.navigate('UserProfile', { userId: pkg.userId })}
            >
              <Avatar name={pkg.postedByName} uri={pkg.postedByPhoto} size={44} showVerified={pkg.postedByVerified} />
              <View style={styles.hostInfo}>
                <Text style={[Typography.titleMd, { color: colors.onSurface }]}>{pkg.postedByName}</Text>
                {pkg.agencyName && <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant }]}>{pkg.agencyName}</Text>}
              </View>
              {typeof pkg.rating === 'number' && pkg.rating > 0 && (
                <View style={styles.ratingPill}>
                  <Star size={14} color="#f59e0b" fill="#f59e0b" />
                  <Text style={[Typography.titleSm, { color: colors.onSurface, marginLeft: 4 }]}>{pkg.rating.toFixed(1)}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Quick stats */}
          <View style={styles.statsRow}>
            {pkg.startDate && (
              <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLow, borderRadius: BorderRadius.lg }]}>
                <Calendar size={18} color={colors.primary} />
                <Text style={[Typography.labelSm, { color: colors.onSurfaceVariant, marginTop: 4 }]}>Starts</Text>
                <Text style={[Typography.titleSm, { color: colors.onSurface }]}>{new Date(pkg.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
              </View>
            )}
            <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLow, borderRadius: BorderRadius.lg }]}>
              <Clock size={18} color={colors.primary} />
              <Text style={[Typography.labelSm, { color: colors.onSurfaceVariant, marginTop: 4 }]}>Duration</Text>
              <Text style={[Typography.titleSm, { color: colors.onSurface }]}>{pkg.durationDays} Days</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLow, borderRadius: BorderRadius.lg }]}>
              <Users size={18} color={colors.primary} />
              <Text style={[Typography.labelSm, { color: colors.onSurfaceVariant, marginTop: 4 }]}>Seats</Text>
              <Text style={[Typography.titleSm, { color: colors.onSurface }]}>{pkg.availableSeats}/{pkg.totalSeats}</Text>
            </View>
          </View>

          {/* Seats bar */}
          <SeatProgressBar available={pkg.availableSeats} total={pkg.totalSeats} />

          {/* Tabs */}
          <TabBar tabs={tabs} activeKey={activeTab} onTabPress={setActiveTab} style={{ marginTop: Spacing['2xl'] }} />

          {activeTab === 'overview' && (
            <View style={styles.tabContent}>
              {pkg.description && <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant, lineHeight: 24 }]}>{pkg.description}</Text>}
              {inclusions.length > 0 && (
                <View style={styles.listSection}>
                  <Text style={[Typography.titleMd, { color: colors.onSurface }]}>Inclusions</Text>
                  {inclusions.map((item, i) => (
                    <View key={i} style={styles.listItem}>
                      <Check size={16} color={colors.success} />
                      <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant, marginLeft: Spacing.sm, flex: 1 }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
              {exclusions.length > 0 && (
                <View style={styles.listSection}>
                  <Text style={[Typography.titleMd, { color: colors.onSurface }]}>Exclusions</Text>
                  {exclusions.map((item, i) => (
                    <View key={i} style={styles.listItem}>
                      <X size={16} color={colors.error} />
                      <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant, marginLeft: Spacing.sm, flex: 1 }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {activeTab === 'itinerary' && (
            <View style={styles.tabContent}>
              {itinerary.length > 0 ? itinerary.map((day, i) => (
                <View key={i} style={[styles.itineraryDay, { borderLeftColor: colors.primary }]}>
                  <View style={[styles.dayBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[Typography.labelSm, { color: '#fff' }]}>Day {i + 1}</Text>
                  </View>
                  <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant, marginTop: Spacing.xs }]}>{day}</Text>
                </View>
              )) : <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant }]}>No itinerary available.</Text>}
            </View>
          )}

          {activeTab === 'terms' && (
            <View style={styles.tabContent}>
              {pkg.termsAndConditions && (
                <View style={styles.listSection}>
                  <Text style={[Typography.titleMd, { color: colors.onSurface }]}>Terms & Conditions</Text>
                  <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant, lineHeight: 22, marginTop: Spacing.sm }]}>{pkg.termsAndConditions}</Text>
                </View>
              )}
              {pkg.cancellationPolicy && (
                <View style={styles.listSection}>
                  <Text style={[Typography.titleMd, { color: colors.onSurface }]}>Cancellation Policy</Text>
                  <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant, lineHeight: 22, marginTop: Spacing.sm }]}>{pkg.cancellationPolicy}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom booking bar */}
      {!isOwn && (
        <View style={[styles.bottomBar, { backgroundColor: colors.surfaceContainerLowest, borderTopColor: colors.outlineVariant }]}>
          <View>
            <Text style={[Typography.labelSm, { color: colors.onSurfaceVariant }]}>per person</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={[Typography.headlineMd, { color: colors.onSurface }]}>₹{displayPrice.toLocaleString()}</Text>
              {hasDiscount && <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, textDecorationLine: 'line-through', marginLeft: 6 }]}>₹{pkg.price.toLocaleString()}</Text>}
            </View>
          </View>
          {existingBooking ? (
            <View style={{ alignItems: 'flex-end' }}>
              <Badge variant="status" status={existingBooking.status.toLowerCase() as any}>
                {existingBooking.status === 'CONFIRMED' ? 'Confirmed' : existingBooking.status === 'PENDING' ? 'Pending' : existingBooking.status === 'REJECTED' ? 'Rejected' : 'Cancelled'}
              </Badge>
              {(existingBooking.status === 'PENDING' || existingBooking.status === 'CONFIRMED') && (
                <TouchableOpacity onPress={handleCancel} style={{ marginTop: 4 }}>
                  <Text style={[Typography.labelSm, { color: colors.error }]}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
              <View style={styles.seatPicker}>
                <TouchableOpacity onPress={() => setSeats(s => Math.max(1, s - 1))}><Minus size={18} color={colors.onSurface} /></TouchableOpacity>
                <Text style={[Typography.titleMd, { color: colors.onSurface, marginHorizontal: Spacing.md }]}>{seats}</Text>
                <TouchableOpacity onPress={() => setSeats(s => Math.min(pkg.availableSeats, s + 1))}><Plus size={18} color={colors.onSurface} /></TouchableOpacity>
              </View>
              <Button title="Book Now" onPress={handleBook} loading={bookingLoading} size="md" />
            </View>
          )}
        </View>
      )}

      {/* WhatsApp / Call Host */}
      {pkg.agencyWhatsapp && (
        <TouchableOpacity
          style={[styles.contactHost, { backgroundColor: '#25d366', borderRadius: BorderRadius.full }]}
          onPress={() => Linking.openURL(`https://wa.me/${pkg.agencyWhatsapp}`)}
        >
          <MessageCircle size={18} color="#fff" />
          <Text style={[Typography.titleSm, { color: '#fff', marginLeft: 6 }]}>Chat with Host</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  heroContainer: { position: 'relative' },
  placeholder: { height: 320, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  heroBadges: { position: 'absolute', bottom: 16, left: 16, flexDirection: 'row', gap: 8 },
  content: { padding: Spacing['2xl'] },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  hostCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, marginTop: Spacing.xl },
  hostInfo: { flex: 1, marginLeft: Spacing.md },
  ratingPill: { flexDirection: 'row', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.lg },
  tabContent: { marginTop: Spacing.xl },
  listSection: { marginTop: Spacing.xl },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginTop: Spacing.sm },
  itineraryDay: { borderLeftWidth: 2, paddingLeft: Spacing.lg, marginBottom: Spacing.xl },
  dayBadge: { paddingHorizontal: Spacing.md, paddingVertical: 2, borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderTopWidth: 1 },
  seatPicker: { flexDirection: 'row', alignItems: 'center' },
  contactHost: { position: 'absolute', bottom: 100, right: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
});
