import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { useTheme, Typography, BorderRadius, Spacing } from '../theme';
import Chip from './Chip';
import Button from './Button';

interface FilterBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  filters: {
    minPrice?: number;
    maxPrice?: number;
    minDays?: number;
    maxDays?: number;
    transportation?: string;
  };
  onFiltersChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
  transportOptions?: { value: string; label: string; icon: string }[];
}

const PRICE_STEPS = [0, 500, 1000, 1500, 2000, 2500, 3000, 4000, 5000];
const DURATION_MAX = 30;

export default function FilterBottomSheet({
  bottomSheetRef,
  filters,
  onFiltersChange,
  onApply,
  onClear,
  transportOptions = [],
}: FilterBottomSheetProps) {
  const { colors } = useTheme();
  const snapPoints = useMemo(() => ['80%'], []);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />,
    []
  );

  const defaultTransports = [
    { value: 'CAR', label: 'Car', icon: '🚗' },
    { value: 'SUV', label: 'SUV', icon: '🚙' },
    { value: 'BUS_AC', label: 'Bus AC', icon: '🚌' },
    { value: 'BUS_NON_AC', label: 'Bus Non-AC', icon: '🚌' },
    { value: 'TRAIN', label: 'Train', icon: '🚂' },
    { value: 'FLIGHT_ECONOMY', label: 'Flight Economy', icon: '✈️' },
    { value: 'FLIGHT_BUSINESS', label: 'Flight Business', icon: '🛫' },
    { value: 'BIKE', label: 'Bike', icon: '🏍️' },
    { value: 'SELF', label: 'Self', icon: '🧍' },
  ];

  const transports = transportOptions.length > 0 ? transportOptions : defaultTransports;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: colors.surfaceContainerLowest, borderRadius: BorderRadius.xl }}
      handleIndicatorStyle={{ backgroundColor: colors.outlineVariant, width: 40 }}
      backdropComponent={renderBackdrop}
    >
      <View style={styles.header}>
        <Text style={[Typography.displaySm, { color: colors.onSurface }]}>Filter Journeys</Text>
        <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
          <View style={[styles.closeBtn, { backgroundColor: colors.surfaceContainerHigh }]}>
            <X size={20} color={colors.onSurfaceVariant} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Price Range */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[Typography.titleLg, { color: colors.onSurface }]}>Price Range</Text>
            <Text style={[Typography.titleSm, { color: colors.primary }]}>
              ${filters.minPrice || 0} — ${filters.maxPrice || '5,000+'}
            </Text>
          </View>
          <View style={styles.chipGrid}>
            {PRICE_STEPS.map((price, i) => {
              const nextPrice = PRICE_STEPS[i + 1] || 5001;
              const isSelected = filters.minPrice === price;
              return (
                <Chip
                  key={price}
                  label={price === 0 ? '$0' : `$${price.toLocaleString()}`}
                  selected={isSelected}
                  onPress={() => onFiltersChange({ ...filters, minPrice: price, maxPrice: nextPrice })}
                />
              );
            })}
          </View>
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[Typography.titleLg, { color: colors.onSurface }]}>Duration</Text>
            <Text style={[Typography.titleSm, { color: colors.primary }]}>
              {filters.minDays || 1} Days — {filters.maxDays || DURATION_MAX} Days
            </Text>
          </View>
          <View style={styles.chipGrid}>
            {[1, 3, 5, 7, 10, 14, 21, 30].map(d => (
              <Chip
                key={d}
                label={`${d} Days`}
                selected={filters.minDays === d}
                onPress={() => onFiltersChange({ ...filters, minDays: d, maxDays: d + 5 })}
              />
            ))}
          </View>
        </View>

        {/* Transport Type */}
        <View style={styles.section}>
          <Text style={[Typography.titleLg, { color: colors.onSurface, marginBottom: Spacing.md }]}>Transport Type</Text>
          <View style={styles.chipGrid}>
            {transports.map(t => (
              <Chip
                key={t.value}
                label={t.label}
                icon={t.icon}
                selected={filters.transportation === t.value}
                onPress={() =>
                  onFiltersChange({
                    ...filters,
                    transportation: filters.transportation === t.value ? undefined : t.value,
                  })
                }
              />
            ))}
          </View>
        </View>

        <View style={{ height: Spacing['5xl'] }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surfaceContainerLowest }]}>
        <Button title="Clear" variant="ghost" onPress={onClear} style={{ flex: 1, marginRight: Spacing.md }} />
        <Button title="Apply Filters" variant="primary" onPress={onApply} style={{ flex: 2 }} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.lg,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  section: {
    marginBottom: Spacing['3xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
});
