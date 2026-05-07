import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ArrowLeft, Star, Phone, MessageCircle, MapPin, CheckCircle } from 'lucide-react-native';
import { HomeStackParamList, User, TravelPackage } from '../../types';
import { authAPI, packageAPI } from '../../services/api';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';
import Avatar from '../../components/Avatar';
import PackageCard from '../../components/PackageCard';
import LoadingSpinner from '../../components/LoadingSpinner';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'UserProfile'>;
  route: RouteProp<HomeStackParamList, 'UserProfile'>;
};

export default function UserProfileScreen({ navigation, route }: Props) {
  const { userId } = route.params;
  const { colors } = useTheme();
  const [profile, setProfile] = useState<User | null>(null);
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [u, pkgs] = await Promise.all([
          authAPI.getUserById(userId),
          packageAPI.getPackagesByUserId(userId),
        ]);
        setProfile(u);
        setPackages(pkgs);
      } catch {} finally { setLoading(false); }
    })();
  }, [userId]);

  if (loading || !profile) return <LoadingSpinner />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={colors.onSurface} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Avatar name={profile.fullName} uri={profile.profilePhoto} size={80} showVerified={profile.phoneVerified} />
          <Text style={[Typography.headlineMd, { color: colors.onSurface, marginTop: Spacing.lg }]}>{profile.fullName}</Text>
          {profile.agencyName && <Text style={[Typography.bodyMd, { color: colors.primary, marginTop: 4 }]}>{profile.agencyName}</Text>}
          {profile.city && (
            <View style={styles.cityRow}>
              <MapPin size={14} color={colors.onSurfaceVariant} />
              <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>{profile.city}</Text>
            </View>
          )}
          {profile.bio && <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.md }]}>{profile.bio}</Text>}

          {/* Contact buttons */}
          <View style={styles.contactRow}>
            {profile.phone && (
              <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.surfaceContainerHigh, borderRadius: BorderRadius.full }]} onPress={() => Linking.openURL(`tel:${profile.phone}`)}>
                <Phone size={18} color={colors.primary} />
                <Text style={[Typography.titleSm, { color: colors.primary, marginLeft: 6 }]}>Call</Text>
              </TouchableOpacity>
            )}
            {profile.whatsappNumber && (
              <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#25d366', borderRadius: BorderRadius.full }]} onPress={() => Linking.openURL(`https://wa.me/${profile.whatsappNumber}`)}>
                <MessageCircle size={18} color="#fff" />
                <Text style={[Typography.titleSm, { color: '#fff', marginLeft: 6 }]}>WhatsApp</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Packages */}
        <View style={styles.packagesSection}>
          <Text style={[Typography.headlineMd, { color: colors.onSurface }]}>
            Trips by {profile.fullName} ({packages.length})
          </Text>
          {packages.map(pkg => (
            <View key={pkg.id} style={{ marginTop: Spacing.lg }}>
              <PackageCard
                pkg={pkg}
                onPress={() => navigation.navigate('PackageDetail', { packageId: pkg.id })}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.lg },
  profileSection: { alignItems: 'center', paddingHorizontal: Spacing['2xl'] },
  cityRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  contactRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  contactBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  packagesSection: { padding: Spacing['2xl'], marginTop: Spacing.xl },
});
