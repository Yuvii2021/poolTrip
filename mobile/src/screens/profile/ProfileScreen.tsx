import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Settings, LayoutDashboard, ChevronRight, LogOut, Moon, Sun, Phone, Mail, Shield, CheckCircle, Edit2, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProfileStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import Input from '../../components/Input';

type Props = { navigation: NativeStackNavigationProp<ProfileStackParamList, 'Profile'> };

export default function ProfileScreen({ navigation }: Props) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout, refreshUser, isAuthenticated } = useAuth();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [city, setCity] = useState(user?.city || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsappNumber || '');
  const [saving, setSaving] = useState(false);

  const openAuth = (screen: 'Login' | 'Register') => {
    const parentNav = navigation.getParent() as any;
    parentNav?.navigate('Auth', { screen, params: screen === 'Login' ? { redirect: 'ProfileTab' } : undefined });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateCurrentUser({ fullName, city, bio, whatsappNumber: whatsapp });
      await refreshUser();
      setEditing(false);
    } catch { Alert.alert('Error', 'Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      try {
        await authAPI.uploadProfilePhoto(result.assets[0].uri, 'profile.jpg', 'image/jpeg');
        await refreshUser();
      } catch { Alert.alert('Error', 'Failed to upload photo'); }
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user || !isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
        <View style={styles.headerRow}>
          <Text style={[Typography.headlineLg, { color: colors.onSurface }]}>Profile</Text>
          <TouchableOpacity onPress={toggleTheme}>
            {isDark ? <Sun size={22} color={colors.onSurface} /> : <Moon size={22} color={colors.onSurface} />}
          </TouchableOpacity>
        </View>
        <View style={styles.guestContainer}>
          <Text style={[Typography.headlineMd, { color: colors.onSurface, textAlign: 'center' }]}>Welcome to TravelHub</Text>
          <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.sm }]}>
            Browse trips freely. Sign in only when you want to publish or book.
          </Text>
          <Button
            title="Sign In"
            onPress={() => openAuth('Login')}
            fullWidth
            style={{ marginTop: Spacing['2xl'] }}
          />
          <Button
            title="Create Account"
            variant="secondary"
            onPress={() => openAuth('Register')}
            fullWidth
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const verificationItems = [
    { label: 'Phone', verified: user.phoneVerified, icon: <Phone size={18} color={user.phoneVerified ? colors.success : colors.onSurfaceVariant} /> },
    { label: 'Email', verified: user.emailVerified, icon: <Mail size={18} color={user.emailVerified ? colors.success : colors.onSurfaceVariant} /> },
  ];
  const verifiedCount = verificationItems.filter(v => v.verified).length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[Typography.headlineLg, { color: colors.onSurface }]}>Profile</Text>
          <TouchableOpacity onPress={toggleTheme}>
            {isDark ? <Sun size={22} color={colors.onSurface} /> : <Moon size={22} color={colors.onSurface} />}
          </TouchableOpacity>
        </View>

        {/* Avatar + info */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handlePickPhoto}>
            <Avatar name={user.fullName} uri={user.profilePhoto} size={80} showVerified={user.phoneVerified} />
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              <Camera size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[Typography.headlineMd, { color: colors.onSurface, marginTop: Spacing.lg }]}>{user.fullName}</Text>
          <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant }]}>{user.email}</Text>
          {user.role === 'AGENCY' && user.agencyName && (
            <Text style={[Typography.titleSm, { color: colors.primary, marginTop: 4 }]}>{user.agencyName}</Text>
          )}
        </View>

        {/* Verification */}
        <View style={[styles.verifyCard, { backgroundColor: colors.surfaceContainerLow, borderRadius: BorderRadius.xl }]}>
          <View style={styles.verifyHeader}>
            <Shield size={20} color={colors.primary} />
            <Text style={[Typography.titleMd, { color: colors.onSurface, marginLeft: Spacing.sm }]}>Verification</Text>
            <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginLeft: 'auto' }]}>{verifiedCount}/{verificationItems.length}</Text>
          </View>
          {verificationItems.map(v => (
            <View key={v.label} style={styles.verifyItem}>
              {v.icon}
              <Text style={[Typography.bodyMd, { color: colors.onSurface, flex: 1, marginLeft: Spacing.md }]}>{v.label}</Text>
              {v.verified ? <CheckCircle size={18} color={colors.success} /> : <Text style={[Typography.labelSm, { color: colors.warning }]}>Pending</Text>}
            </View>
          ))}
        </View>

        {/* Edit section */}
        {editing ? (
          <View style={[styles.editSection, { backgroundColor: colors.surfaceContainerLow, borderRadius: BorderRadius.xl }]}>
            <Input label="Full Name" value={fullName} onChangeText={setFullName} />
            <Input label="City" value={city} onChangeText={setCity} />
            <Input label="Bio" value={bio} onChangeText={setBio} multiline />
            <Input label="WhatsApp" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />
            <View style={styles.editActions}>
              <Button title="Save" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
              <Button title="Cancel" variant="ghost" onPress={() => setEditing(false)} style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surfaceContainerLow, borderRadius: BorderRadius.xl }]}
            onPress={() => setEditing(true)}
          >
            <Edit2 size={20} color={colors.onSurfaceVariant} />
            <Text style={[Typography.bodyMd, { color: colors.onSurface, flex: 1, marginLeft: Spacing.lg }]}>Edit Profile</Text>
            <ChevronRight size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}

        {/* Dashboard / publishing */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.surfaceContainerLow, borderRadius: BorderRadius.xl }]}
          onPress={() => (navigation.getParent() as any)?.navigate('PublishTab')}
        >
          <LayoutDashboard size={20} color={colors.primary} />
          <Text style={[Typography.bodyMd, { color: colors.onSurface, flex: 1, marginLeft: Spacing.lg }]}>My Trips & Publishing</Text>
          <ChevronRight size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.surfaceContainerLow, borderRadius: BorderRadius.xl }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[Typography.bodyMd, { color: colors.error, flex: 1, marginLeft: Spacing.lg }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing['2xl'], paddingBottom: Spacing['4xl'] },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing['2xl'], paddingBottom: Spacing.lg },
  guestContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing['2xl'] },
  profileSection: { alignItems: 'center', paddingBottom: Spacing['2xl'] },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  verifyCard: { padding: Spacing.xl, marginBottom: Spacing.lg },
  verifyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  verifyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  editSection: { padding: Spacing.xl, marginBottom: Spacing.lg },
  editActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.xl, marginBottom: Spacing.md },
});
