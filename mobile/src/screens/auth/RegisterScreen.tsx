import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User, Phone, Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import OTPInput from '../../components/OTPInput';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { register, isAuthenticated } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (isAuthenticated && navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [isAuthenticated, navigation]);

  const startResendTimer = useCallback(() => {
    setResendTimer(60);
    const iv = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(iv); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendOtp = async () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authAPI.sendOtp(phone.trim());
      setStep(2);
      startResendTimer();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (otp.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ fullName: name.trim(), email: email.trim(), phone: phone.trim(), password, Otp: otp, role: 'USER' });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authAPI.sendOtp(phone.trim());
      startResendTimer();
      Alert.alert('OTP Sent', 'A new verification code has been sent.');
    } catch {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <TouchableOpacity style={styles.back} onPress={() => step === 2 ? setStep(1) : navigation.goBack()}>
            <ArrowLeft size={24} color={colors.onSurface} />
          </TouchableOpacity>

          {/* Step indicator */}
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.stepLine, { backgroundColor: step === 2 ? colors.primary : colors.outlineVariant }]} />
            <View style={[styles.stepDot, { backgroundColor: step === 2 ? colors.primary : colors.outlineVariant }]} />
          </View>

          <Text style={[Typography.displayMd, { color: colors.onSurface, marginTop: Spacing['2xl'] }]}>
            {step === 1 ? 'Create your account' : 'Verify your phone'}
          </Text>
          <Text style={[Typography.bodyLg, { color: colors.onSurfaceVariant, marginTop: Spacing.sm, marginBottom: Spacing['3xl'] }]}>
            {step === 1 ? 'Join premium group travel experiences.' : `Enter the 6-digit code sent to ${phone}`}
          </Text>

          {step === 1 ? (
            <>
              <Input label="Full Name" value={name} onChangeText={setName} placeholder="John Doe" leftIcon={<User size={20} color={colors.onSurfaceVariant} />} />
              <Input label="Phone Number" value={phone} onChangeText={setPhone} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" leftIcon={<Phone size={20} color={colors.onSurfaceVariant} />} />
              <Input label="Email" value={email} onChangeText={setEmail} placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none" leftIcon={<Mail size={20} color={colors.onSurfaceVariant} />} />
              <Input label="Password" value={password} onChangeText={setPassword} placeholder="Min. 6 characters" isPassword leftIcon={<Lock size={20} color={colors.onSurfaceVariant} />} />
              <Input label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter password" isPassword leftIcon={<Lock size={20} color={colors.onSurfaceVariant} />} />

              {error ? <Text style={[Typography.bodySm, { color: colors.error, marginBottom: Spacing.lg }]}>{error}</Text> : null}

              <Button title="Continue  →" onPress={handleSendOtp} loading={loading} fullWidth size="lg" />
            </>
          ) : (
            <>
              <OTPInput length={6} value={otp} onChange={setOtp} />

              {error ? <Text style={[Typography.bodySm, { color: colors.error, marginTop: Spacing.lg }]}>{error}</Text> : null}

              <Button title="Verify & Create Account" onPress={handleVerifyAndRegister} loading={loading} fullWidth size="lg" style={{ marginTop: Spacing['3xl'] }} />

              <View style={styles.resendRow}>
                <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant }]}>Didn't receive the code? </Text>
                {resendTimer > 0 ? (
                  <Text style={[Typography.titleSm, { color: colors.onSurfaceVariant }]}>Resend in {resendTimer}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={[Typography.titleSm, { color: colors.primary }]}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[Typography.titleSm, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing['2xl'], paddingBottom: Spacing['4xl'] },
  back: { paddingVertical: Spacing.lg },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  stepDot: { width: 12, height: 12, borderRadius: 6 },
  stepLine: { flex: 1, height: 2, marginHorizontal: Spacing.xs },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing['2xl'] },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing['4xl'] },
});
