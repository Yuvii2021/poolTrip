import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProfileStackParamList, PackageRequest, PackageType, TravelPackage } from '../../types';
import { packageAPI } from '../../services/api';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Chip from '../../components/Chip';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'CreatePackage'>;
  route: RouteProp<ProfileStackParamList, 'CreatePackage'>;
};

const packageTypes: { label: string; value: PackageType }[] = [
  { label: '⛰️ Adventure', value: 'ADVENTURE' },
  { label: '🏖️ Beach', value: 'BEACH' },
  { label: '🕌 Pilgrimage', value: 'PILGRIMAGE' },
  { label: '💑 Honeymoon', value: 'HONEYMOON' },
  { label: '👨‍👩‍👧 Family', value: 'FAMILY' },
  { label: '🦁 Wildlife', value: 'WILDLIFE' },
  { label: '🚢 Cruise', value: 'CRUISE' },
  { label: '💎 Luxury', value: 'LUXURY' },
  { label: '💰 Budget', value: 'BUDGET' },
  { label: '🏛️ Cultural', value: 'CULTURAL' },
];

const transportOptions = ['CAR', 'SUV', 'BUS', 'MINI_BUS', 'TRAIN', 'FLIGHT', 'BIKE'];

export default function CreatePackageScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const editId = route.params?.packageId;

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [origin, setOrigin] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [durationNights, setDurationNights] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [startDate, setStartDate] = useState('');
  const [packageType, setPackageType] = useState<PackageType>('ADVENTURE');
  const [transportation, setTransportation] = useState('BUS');
  const [inclusions, setInclusions] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [terms, setTerms] = useState('');
  const [cancellation, setCancellation] = useState('');
  const [mediaUris, setMediaUris] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPkg, setLoadingPkg] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      (async () => {
        try {
          const pkg = await packageAPI.getPackageById(editId);
          setTitle(pkg.title);
          setDestination(pkg.destination);
          setOrigin(pkg.origin || '');
          setDescription(pkg.description || '');
          setPrice(String(pkg.price));
          setDiscountedPrice(pkg.discountedPrice ? String(pkg.discountedPrice) : '');
          setDurationDays(String(pkg.durationDays));
          setDurationNights(pkg.durationNights ? String(pkg.durationNights) : '');
          setTotalSeats(String(pkg.totalSeats));
          setStartDate(pkg.startDate || '');
          setPackageType(pkg.packageType);
          setTransportation(pkg.transportation || pkg.vehicleType || 'BUS');
          setInclusions(Array.isArray(pkg.inclusions) ? pkg.inclusions.join(', ') : '');
          setExclusions(Array.isArray(pkg.exclusions) ? pkg.exclusions.join(', ') : '');
          setTerms(pkg.termsAndConditions || '');
          setCancellation(pkg.cancellationPolicy || '');
          const media = Array.isArray(pkg.media) ? pkg.media.filter(u => u?.startsWith('http')) : [];
          setExistingMedia(media);
        } catch {} finally { setLoadingPkg(false); }
      })();
    }
  }, [editId]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setMediaUris(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const removeMedia = (uri: string) => setMediaUris(prev => prev.filter(u => u !== uri));
  const removeExisting = (url: string) => setExistingMedia(prev => prev.filter(u => u !== url));

  const handleSubmit = async () => {
    if (!title.trim() || !destination.trim() || !price || !durationDays || !totalSeats) {
      Alert.alert('Missing Fields', 'Please fill in title, destination, price, duration, and seats.');
      return;
    }

    setLoading(true);
    try {
      const req: PackageRequest = {
        title: title.trim(),
        destination: destination.trim(),
        origin: origin.trim() || undefined,
        description: description.trim() || undefined,
        price: Number(price),
        discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
        durationDays: Number(durationDays),
        durationNights: durationNights ? Number(durationNights) : undefined,
        totalSeats: Number(totalSeats),
        startDate: startDate || undefined,
        packageType,
        transportation,
        inclusions: inclusions || undefined,
        exclusions: exclusions || undefined,
        termsAndConditions: terms || undefined,
        cancellationPolicy: cancellation || undefined,
        existingMediaUrls: existingMedia.length > 0 ? existingMedia : undefined,
      };

      const mediaAssets = mediaUris.map((uri, i) => ({
        uri,
        fileName: `photo_${i}.jpg`,
        mimeType: 'image/jpeg',
      }));

      if (editId) {
        await packageAPI.updatePackage(editId, req, mediaAssets);
      } else {
        await packageAPI.createPackage(req, mediaAssets);
      }
      Alert.alert('Success', editId ? 'Package updated!' : 'Package created!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save package');
    } finally { setLoading(false); }
  };

  if (loadingPkg) return <View style={[styles.safe, { backgroundColor: colors.surface }]} />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[Typography.headlineMd, { color: colors.onSurface, marginLeft: Spacing.lg }]}>
          {editId ? 'Edit Package' : 'Create Package'}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Basic info */}
        <Text style={[Typography.titleMd, { color: colors.onSurface, marginBottom: Spacing.md }]}>Basic Info</Text>
        <Input label="Title" value={title} onChangeText={setTitle} placeholder="Trip title" />
        <Input label="Destination" value={destination} onChangeText={setDestination} placeholder="Where to?" />
        <Input label="Origin" value={origin} onChangeText={setOrigin} placeholder="Starting from" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Describe the trip" multiline />

        {/* Pricing */}
        <Text style={[Typography.titleMd, { color: colors.onSurface, marginTop: Spacing.xl, marginBottom: Spacing.md }]}>Pricing & Dates</Text>
        <View style={styles.row}>
          <View style={styles.half}><Input label="Price (₹)" value={price} onChangeText={setPrice} keyboardType="numeric" /></View>
          <View style={styles.half}><Input label="Discounted" value={discountedPrice} onChangeText={setDiscountedPrice} keyboardType="numeric" /></View>
        </View>
        <View style={styles.row}>
          <View style={styles.half}><Input label="Days" value={durationDays} onChangeText={setDurationDays} keyboardType="numeric" /></View>
          <View style={styles.half}><Input label="Nights" value={durationNights} onChangeText={setDurationNights} keyboardType="numeric" /></View>
        </View>
        <View style={styles.row}>
          <View style={styles.half}><Input label="Total Seats" value={totalSeats} onChangeText={setTotalSeats} keyboardType="numeric" /></View>
          <View style={styles.half}><Input label="Start Date" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" /></View>
        </View>

        {/* Type */}
        <Text style={[Typography.titleMd, { color: colors.onSurface, marginTop: Spacing.xl, marginBottom: Spacing.md }]}>Package Type</Text>
        <View style={styles.chipWrap}>
          {packageTypes.map(t => (
            <Chip key={t.value} label={t.label} selected={packageType === t.value} onPress={() => setPackageType(t.value)} />
          ))}
        </View>

        {/* Transport */}
        <Text style={[Typography.titleMd, { color: colors.onSurface, marginTop: Spacing.xl, marginBottom: Spacing.md }]}>Transportation</Text>
        <View style={styles.chipWrap}>
          {transportOptions.map(t => (
            <Chip key={t} label={t} selected={transportation === t} onPress={() => setTransportation(t)} />
          ))}
        </View>

        {/* Media */}
        <Text style={[Typography.titleMd, { color: colors.onSurface, marginTop: Spacing.xl, marginBottom: Spacing.md }]}>Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
          {existingMedia.map(url => (
            <View key={url} style={styles.mediaItem}>
              <Image source={{ uri: url }} style={styles.mediaImg} />
              <TouchableOpacity style={styles.mediaRemove} onPress={() => removeExisting(url)}>
                <X size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {mediaUris.map(uri => (
            <View key={uri} style={styles.mediaItem}>
              <Image source={{ uri }} style={styles.mediaImg} />
              <TouchableOpacity style={styles.mediaRemove} onPress={() => removeMedia(uri)}>
                <X size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={[styles.addMedia, { backgroundColor: colors.surfaceContainerHigh, borderRadius: BorderRadius.lg }]} onPress={pickImages}>
            <Plus size={24} color={colors.onSurfaceVariant} />
            <Text style={[Typography.labelSm, { color: colors.onSurfaceVariant, marginTop: 4 }]}>Add</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Details */}
        <Text style={[Typography.titleMd, { color: colors.onSurface, marginTop: Spacing.xl, marginBottom: Spacing.md }]}>Details</Text>
        <Input label="Inclusions" value={inclusions} onChangeText={setInclusions} placeholder="Comma-separated" multiline />
        <Input label="Exclusions" value={exclusions} onChangeText={setExclusions} placeholder="Comma-separated" multiline />
        <Input label="Terms & Conditions" value={terms} onChangeText={setTerms} multiline />
        <Input label="Cancellation Policy" value={cancellation} onChangeText={setCancellation} multiline />

        <Button title={editId ? 'Update Package' : 'Create Package'} onPress={handleSubmit} loading={loading} fullWidth size="lg" style={{ marginTop: Spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.lg },
  scrollContent: { paddingHorizontal: Spacing['2xl'], paddingBottom: Spacing['4xl'] },
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  mediaScroll: { flexDirection: 'row' },
  mediaItem: { marginRight: Spacing.md, position: 'relative' },
  mediaImg: { width: 80, height: 80, borderRadius: BorderRadius.lg },
  mediaRemove: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: '#00000088', alignItems: 'center', justifyContent: 'center' },
  addMedia: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
});
