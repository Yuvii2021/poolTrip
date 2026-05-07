import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, SlidersHorizontal, MapPin, Compass, Calendar, X } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { HomeStackParamList, TravelPackage, PackageFilters, FilterOptionsResponse } from '../../types';
import { packageAPI } from '../../services/api';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';
import PackageCard from '../../components/PackageCard';
import FilterBottomSheet from '../../components/FilterBottomSheet';
import Chip from '../../components/Chip';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

type Props = { navigation: NativeStackNavigationProp<HomeStackParamList, 'Home'> };

const categories = [
  { label: 'All', value: '' },
  { label: '⛰️ Mountain', value: 'ADVENTURE' },
  { label: '🏖️ Beach', value: 'BEACH' },
  { label: '🕌 Yatra', value: 'PILGRIMAGE' },
  { label: '💑 Honeymoon', value: 'HONEYMOON' },
  { label: '👨‍👩‍👧 Family', value: 'FAMILY' },
  { label: '🦁 Wildlife', value: 'WILDLIFE' },
  { label: '🚢 Cruise', value: 'CRUISE' },
  { label: '💎 Luxury', value: 'LUXURY' },
  { label: '💰 Budget', value: 'BUDGET' },
];

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [featuredPackages, setFeaturedPackages] = useState<TravelPackage[]>([]);
  const [searchResults, setSearchResults] = useState<TravelPackage[] | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [activeField, setActiveField] = useState<'from' | 'to' | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filters, setFilters] = useState<PackageFilters>({});
  const filterRef = useRef<BottomSheet>(null);

  const loadPackages = useCallback(async () => {
    try {
      const [allPackages, featured, options] = await Promise.all([
        packageAPI.getAllPackages(),
        packageAPI.getFeaturedPackages(),
        packageAPI.getFilterOptions(),
      ]);
      setPackages(allPackages);
      setFeaturedPackages(featured.slice(0, 5));
      setFilterOptions(options);
    } catch (e) {
      console.error('Failed to load packages', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadPackages(); }, [loadPackages]);

  const onRefresh = () => { setRefreshing(true); loadPackages(); };

  const applyFilters = useCallback((list: TravelPackage[]) => list.filter((p) => {
    if (filters.days !== undefined && p.durationDays !== filters.days) return false;
    if (filters.minDays !== undefined && p.durationDays < filters.minDays) return false;
    if (filters.maxDays !== undefined && p.durationDays > filters.maxDays) return false;
    if (filters.transportation) {
      const pkgTransport = (p.transportation || p.vehicleType || '').toUpperCase();
      if (pkgTransport !== filters.transportation.toUpperCase()) return false;
    }
    if (filters.minPrice !== undefined) {
      const currentPrice = p.discountedPrice || p.price;
      if (currentPrice < filters.minPrice) return false;
    }
    if (filters.maxPrice !== undefined) {
      const currentPrice = p.discountedPrice || p.price;
      if (currentPrice > filters.maxPrice) return false;
    }
    if (filters.featured && !p.featured) return false;
    return true;
  }), [filters]);

  const handleSearch = useCallback(async () => {
    const origin = searchFrom.trim();
    const destination = searchTo.trim();
    const hasSearchInputs = Boolean(origin || destination || searchDate);
    const hasFilters = Object.keys(filters).length > 0;

    if (!hasSearchInputs && !hasFilters) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    setLocationSuggestions([]);
    setActiveField(null);
    try {
      let resultPackages: TravelPackage[] = [];
      if (origin && destination) {
        const nearby = await packageAPI.searchPackagesNearby(origin, destination);
        resultPackages = nearby.map((item) => item.packageInfo);
      } else if (origin) {
        const nearby = await packageAPI.searchPackagesFromOrigin(origin);
        resultPackages = nearby.map((item) => item.packageInfo);
      } else {
        resultPackages = await packageAPI.searchPackages(destination || '');
      }

      if (searchDate) {
        const selectedDate = new Date(searchDate);
        resultPackages = resultPackages.filter((pkg) => {
          if (!pkg.startDate) return false;
          return new Date(pkg.startDate) >= selectedDate;
        });
      }

      setSearchResults(applyFilters(resultPackages));
    } catch (error) {
      console.error('Failed to search packages', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchFrom, searchTo, searchDate, filters, applyFilters]);

  const clearSearch = () => {
    setSearchFrom('');
    setSearchTo('');
    setSearchDate('');
    setFilters({});
    setSearchResults(null);
    setLocationSuggestions([]);
    setActiveField(null);
  };

  const buildSuggestions = useCallback(
    (query: string) => {
      const source = activeField === 'from' ? packages.map((p) => p.origin || '').filter(Boolean) : packages.map((p) => p.destination || '').filter(Boolean);
      const unique = Array.from(new Set(source.map((s) => s.trim())));
      if (!query.trim()) {
        setLocationSuggestions(unique.slice(0, 8));
        return;
      }
      const q = query.toLowerCase();
      const filtered = unique.filter((item) => item.toLowerCase().includes(q)).slice(0, 8);
      setLocationSuggestions(filtered);
    },
    [activeField, packages]
  );

  const selectSuggestion = (value: string) => {
    if (activeField === 'from') setSearchFrom(value);
    if (activeField === 'to') setSearchTo(value);
    setLocationSuggestions([]);
    setActiveField(null);
  };

  const activeList = searchResults ?? packages;

  const filteredPackages = applyFilters(activeList).filter((p) => {
    if (selectedCategory && p.packageType !== selectedCategory) return false;
    return true;
  });

  const handlePackagePress = (pkg: TravelPackage) => {
    navigation.navigate('PackageDetail', { packageId: pkg.id });
  };

  const renderHeader = () => (
    <View>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.surfaceContainerLow, borderRadius: BorderRadius.xl }]}>
        <Text style={[Typography.displayMd, { color: colors.onSurface }]}>Book a seat. Join the trip.</Text>
        <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant, marginTop: Spacing.xs }]}>
          Smart group travel with better prices
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surfaceContainerLowest, borderRadius: BorderRadius.xl }]}>
        <View style={styles.searchFieldRow}>
          <MapPin size={18} color={colors.onSurfaceVariant} />
          <TextInput
            style={[styles.searchInput, { color: colors.onSurface }]}
            placeholder="From (your city)"
            placeholderTextColor={colors.onSurfaceVariant}
            value={searchFrom}
            onFocus={() => {
              setActiveField('from');
              buildSuggestions(searchFrom);
            }}
            onChangeText={(text) => {
              setSearchFrom(text);
              setActiveField('from');
              buildSuggestions(text);
            }}
          />
        </View>

        <View style={[styles.searchDivider, { backgroundColor: colors.outlineVariant }]} />

        <View style={styles.searchFieldRow}>
          <Compass size={18} color={colors.onSurfaceVariant} />
          <TextInput
            style={[styles.searchInput, { color: colors.onSurface }]}
            placeholder="To (destination)"
            placeholderTextColor={colors.onSurfaceVariant}
            value={searchTo}
            onFocus={() => {
              setActiveField('to');
              buildSuggestions(searchTo);
            }}
            onChangeText={(text) => {
              setSearchTo(text);
              setActiveField('to');
              buildSuggestions(text);
            }}
          />
        </View>

        <View style={[styles.searchDivider, { backgroundColor: colors.outlineVariant }]} />

        <View style={styles.searchFieldRow}>
          <Calendar size={18} color={colors.onSurfaceVariant} />
          <TextInput
            style={[styles.searchInput, { color: colors.onSurface }]}
            placeholder="Departure (YYYY-MM-DD)"
            placeholderTextColor={colors.onSurfaceVariant}
            value={searchDate}
            onChangeText={setSearchDate}
            onFocus={() => {
              setActiveField(null);
              setLocationSuggestions([]);
            }}
          />
        </View>

        <View style={styles.searchActions}>
          <TouchableOpacity onPress={() => filterRef.current?.expand()} style={[styles.filterBtn, { backgroundColor: colors.surfaceContainerHigh, borderRadius: BorderRadius.full }]}>
            <SlidersHorizontal size={18} color={colors.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSearch} style={[styles.searchBtn, { backgroundColor: colors.primary, borderRadius: BorderRadius.full }]}>
            <Search size={18} color="#fff" />
          </TouchableOpacity>
          {(searchResults !== null || Object.keys(filters).length > 0) && (
            <TouchableOpacity onPress={clearSearch} style={[styles.filterBtn, { backgroundColor: colors.surfaceContainerHigh, borderRadius: BorderRadius.full }]}>
              <X size={18} color={colors.onSurface} />
            </TouchableOpacity>
          )}
        </View>

        {locationSuggestions.length > 0 && activeField && (
          <View style={[styles.suggestionsBox, { backgroundColor: colors.surfaceContainerHigh, borderRadius: BorderRadius.lg }]}>
            {locationSuggestions.map((item) => (
              <TouchableOpacity
                key={`${activeField}-${item}`}
                style={styles.suggestionItem}
                onPress={() => selectSuggestion(item)}
              >
                <MapPin size={14} color={colors.onSurfaceVariant} />
                <Text style={[Typography.bodyMd, { color: colors.onSurface, marginLeft: Spacing.sm }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={i => i.value || 'ALL'}
        contentContainerStyle={styles.chipRow}
        renderItem={({ item }) => (
          <Chip
            label={item.label}
            selected={selectedCategory === item.value}
            onPress={() => setSelectedCategory(item.value)}
          />
        )}
      />

      {/* Featured */}
      {featuredPackages.length > 0 && searchResults === null && !selectedCategory && (
        <View style={styles.section}>
          <Text style={[Typography.headlineMd, { color: colors.onSurface }]}>Editor's Picks</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={featuredPackages}
            keyExtractor={i => String(i.id)}
            contentContainerStyle={{ paddingTop: Spacing.lg }}
            renderItem={({ item }) => (
              <View style={{ width: width * 0.78, marginRight: Spacing.lg }}>
                <PackageCard pkg={item} featured onPress={() => handlePackagePress(item)} />
              </View>
            )}
          />
        </View>
      )}

      {/* Section header */}
      <View style={[styles.sectionHeader, { marginTop: Spacing['2xl'] }]}>
        <Text style={[Typography.headlineMd, { color: colors.onSurface }]}>
          {selectedCategory ? categories.find(c => c.value === selectedCategory)?.label : searchResults ? 'Search Results' : 'All Trips'}
        </Text>
        <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant }]}>
          {filteredPackages.length} {filteredPackages.length === 1 ? 'trip' : 'trips'}
        </Text>
      </View>
    </View>
  );

  if (loading) return <LoadingSpinner message="Loading trips..." />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <FlatList
        data={filteredPackages}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PackageCard pkg={item} onPress={() => handlePackagePress(item)} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<EmptyState icon="search" title="No trips found" subtitle="Try adjusting your filters" />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      />
      <FilterBottomSheet
        bottomSheetRef={filterRef}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={() => {
          filterRef.current?.close();
          if (searchResults !== null) {
            setSearchResults((prev) => applyFilters(prev ?? []));
          }
        }}
        onClear={() => { setFilters({}); filterRef.current?.close(); }}
        transportOptions={filterOptions?.transportationOptions}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: {
    marginHorizontal: Spacing['2xl'],
    marginTop: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  searchContainer: {
    marginHorizontal: Spacing['2xl'],
    marginTop: Spacing.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  searchFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: Spacing.sm,
  },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: 15 },
  searchDivider: { height: 1, marginHorizontal: Spacing.sm, opacity: 0.35 },
  searchActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  suggestionsBox: { marginTop: Spacing.sm, overflow: 'hidden' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  filterBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  searchBtn: { flex: 1, height: 42, alignItems: 'center', justifyContent: 'center' },
  chipRow: { paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.lg, gap: Spacing.sm },
  section: { paddingHorizontal: Spacing['2xl'], marginTop: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing['2xl'] },
  listContent: { paddingBottom: Spacing['4xl'] },
  cardWrapper: { paddingHorizontal: Spacing['2xl'], marginBottom: Spacing.lg },
});
