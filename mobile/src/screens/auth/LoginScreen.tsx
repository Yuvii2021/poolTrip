import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Phone, Lock } from 'lucide-react-native';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';
import Input from '../../components/Input';
import Button from '../../components/Button';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
  route: RouteProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation, route }: Props) {
  const { colors, isDark } = useTheme();
  const { login, isAuthenticated } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    const redirect = route.params?.redirect;
    if (redirect) {
      navigation.getParent()?.navigate('Main');
    }
  }, [isAuthenticated, navigation, route.params?.redirect]);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(phone.trim(), password);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[Typography.displaySm, { color: colors.primary }]}>TravelHub</Text>
            {isDark && (
              <Text style={[Typography.labelMd, { color: colors.onSurfaceVariant, marginTop: 4, textTransform: 'uppercase', letterSpacing: 2 }]}>
                Elevated Journeys Await
              </Text>
            )}
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: isDark ? colors.surfaceContainerLow : colors.surfaceContainerLowest, borderRadius: BorderRadius.xl }]}>
            <Text style={[Typography.displayMd, { color: colors.onSurface }]}>Welcome back.</Text>
            <Text style={[Typography.bodyLg, { color: colors.onSurfaceVariant, marginTop: Spacing.sm, marginBottom: Spacing['3xl'] }]}>
              Enter your details to access your dashboard.
            </Text>

            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (555) 000-0000"
              keyboardType="phone-pad"
              leftIcon={<Phone size={20} color={colors.onSurfaceVariant} />}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              isPassword
              leftIcon={<Lock size={20} color={colors.onSurfaceVariant} />}
              rightAction={{
                label: 'Forgot Password?',
                onPress: () => navigation.navigate('ForgotPassword'),
              }}
            />

            {error ? (
              <Text style={[Typography.bodySm, { color: colors.error, marginBottom: Spacing.lg }]}>{error}</Text>
            ) : null}

            <Button
              title="Sign In  →"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant }]} />
              <Text style={[Typography.labelMd, { color: colors.onSurfaceVariant, marginHorizontal: Spacing.lg }]}>
                OR CONTINUE WITH
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant }]} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={[styles.socialBtn, { backgroundColor: colors.surfaceContainerHigh, borderRadius: BorderRadius.full }]}
              >
                <Text style={[Typography.titleSm, { color: colors.onSurface }]}>🇬  Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.socialBtn, { backgroundColor: colors.surfaceContainerHigh, borderRadius: BorderRadius.full }]}
              >
                <Text style={[Typography.titleSm, { color: colors.onSurface }]}>  Apple {Platform.OS === 'ios' ? 'ID' : ''}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[Typography.titleSm, { color: colors.primary }]}>Register Now</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[Typography.displaySm, { color: colors.primary }]}>TravelHub</Text>
            <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginTop: Spacing.xs, textAlign: 'center' }]}>
              Premium group adventures for the modern explorer.
            </Text>
            <View style={styles.footerLinks}>
              <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant }]}>Privacy Policy</Text>
              <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant, marginHorizontal: Spacing.xl }]}>Terms of Service</Text>
              <Text style={[Typography.bodySm, { color: colors.onSurfaceVariant }]}>Contact Support</Text>
            </View>
            <Text style={[Typography.labelSm, { color: colors.outlineVariant, marginTop: Spacing.md }]}>
              © 2024 TravelHub Inc. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['6xl'],
  },
  formCard: {
    padding: Spacing['2xl'],
    marginBottom: Spacing['3xl'],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing['3xl'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialBtn: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['6xl'],
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
  },
  footerLinks: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  },
});
