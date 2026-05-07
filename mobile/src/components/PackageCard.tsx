import React from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet, Dimensions } from 'react-native';
import { MapPin, Users, Star } from 'lucide-react-native';
import { TravelPackage } from '../types';
import { useTheme, Typography, BorderRadius, Spacing } from '../theme';
import Avatar from './Avatar';
import Badge from './Badge';
import SeatProgressBar from './SeatProgressBar';

interface PackageCardProps {
  pkg: TravelPackage;
  onPress: () => void;
  featured?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PackageCard({ pkg, onPress, featured = false }: PackageCardProps) {
  const { colors, shadows } = useTheme();

  const displayPrice = pkg.discountedPrice || pkg.price;
  const hasDiscount = pkg.discountedPrice && pkg.discountedPrice < pkg.price;
  const imageUrl = pkg.media?.[0];

  if (featured) {
    // Editorial tile card (featured carousel)
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        style={[
          styles.featuredCard,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderRadius: BorderRadius.xl,
            width: SCREEN_WIDTH * 0.75,
          },
          shadows.md,
        ]}
      >
        <View style={{ height: 200, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, overflow: 'hidden' }}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.featuredImage} />
          ) : (
            <View style={[styles.featuredImage, { backgroundColor: colors.surfaceContainerHigh }]} />
          )}
          {/* Glassmorphism rating badge */}
          {pkg.rating ? (
            <Badge style={styles.ratingBadge}>
              <Star size={14} color={colors.warning} fill={colors.warning} />
              <Text style={[Typography.labelMd, { color: colors.onSurface, marginLeft: 4 }]}>
                {pkg.rating.toFixed(1)}
              </Text>
            </Badge>
          ) : null}
          {/* Duration badge */}
          <Badge style={styles.durationBadge}>
            <Text style={[Typography.labelSm, { color: colors.onSurface }]}>
              {pkg.durationDays} Days
            </Text>
          </Badge>
        </View>
        <View style={styles.featuredContent}>
          <Text style={[Typography.labelSm, { color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1 }]}>
            {pkg.destination}
          </Text>
          <Text style={[Typography.headlineSm, { color: colors.onSurface, marginTop: 4 }]} numberOfLines={2}>
            {pkg.title}
          </Text>
          <View style={styles.hostRow}>
            <Avatar uri={pkg.postedByPhoto} name={pkg.postedByName} size={28} />
            <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginLeft: 8 }]} numberOfLines={1}>
              {pkg.postedByName || pkg.agencyName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Standard list card
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.surfaceContainerLowest, borderRadius: BorderRadius.lg },
        shadows.sm,
      ]}
    >
      <View style={{ height: 160, borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg, overflow: 'hidden' }}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, { backgroundColor: colors.surfaceContainerHigh }]} />
        )}
        {pkg.availableSeats <= 3 && pkg.availableSeats > 0 && (
          <Badge variant="status" status="pending" style={styles.limitedBadge}>
            Limited Spots
          </Badge>
        )}
        <Badge style={styles.durationBadgeCard}>
          <Text style={[Typography.labelSm, { color: colors.onSurface }]}>{pkg.durationDays} Days</Text>
        </Badge>
        {pkg.featured && (
          <Badge variant="status" status="confirmed" style={styles.featuredBadgeLabel}>
            HOT
          </Badge>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[Typography.titleMd, { color: colors.onSurface, flex: 1 }]} numberOfLines={2}>
            {pkg.title}
          </Text>
          <View style={{ alignItems: 'flex-end' }}>
            {hasDiscount && (
              <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, textDecorationLine: 'line-through' }]}>
                ₹{pkg.price.toLocaleString()}
              </Text>
            )}
            <Text style={[Typography.headlineSm, { color: colors.onSurface }]}>
              ₹{displayPrice.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <MapPin size={14} color={colors.onSurfaceVariant} />
          <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginLeft: 4 }]} numberOfLines={1}>
            {(pkg.origin || 'Any')} {'->'} {pkg.destination}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.hostRow}>
            <Avatar uri={pkg.postedByPhoto} name={pkg.postedByName} size={24} />
            <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginLeft: 6 }]} numberOfLines={1}>
              {pkg.postedByName || pkg.agencyName}
            </Text>
          </View>
          <View style={styles.seatsInfo}>
            <Users size={14} color={colors.primary} />
            <Text style={[Typography.labelSm, { color: colors.primary, marginLeft: 4 }]}>
              {pkg.availableSeats} seats left
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Featured card
  featuredCard: {
    marginRight: Spacing.lg,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredContent: {
    padding: Spacing.lg,
  },
  ratingBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
  durationBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
  },

  // Standard card
  card: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationBadgeCard: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
  },
  limitedBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
  },
  featuredBadgeLabel: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
});
