import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Phone, Lock } from 'lucide-react-native';
import { AuthStackParamList } from '../../types';
import { authAPI } from '../../services/api';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import OTPInput from '../../components/OTPInput';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'> };

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

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
    if (!phone.trim()) { setError('Please enter your phone number'); return; }
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword(phone.trim());
      setStep(2);
      startResendTimer();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length < 6) { setError('Please enter the 6-digit code'); return; }
    setError('');
    setStep(3);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await authAPI.resetPassword(phone.trim(), otp, newPassword);
      Alert.alert('Success', 'Password reset successfully', [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Phone', 'Verify', 'Reset'];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => {
            if (step === 1) navigation.goBack();
            else setStep((step - 1) as 1 | 2);
          }}>
            <ArrowLeft size={24} color={colors.onSurface} />
          </TouchableOpacity>

          {/* Step indicator */}
          <View style={styles.stepRow}>
            {stepLabels.map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && <View style={[styles.stepLine, { backgroundColor: i < step ? colors.primary : colors.outlineVariant }]} />}
                <View style={{ alignItems: 'center' }}>
                  <View style={[styles.stepDot, { backgroundColor: i < step ? colors.primary : colors.outlineVariant }]}>
                    <Text style={[Typography.labelSm, { color: i < step ? '#fff' : colors.onSurfaceVariant }]}>{i + 1}</Text>
                  </View>
                  <Text style={[Typography.labelSm, { color: i < step ? colors.primary : colors.onSurfaceVariant, marginTop: 4 }]}>{label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          <Text style={[Typography.displayMd, { color: colors.onSurface, marginTop: Spacing['3xl'] }]}>
            {step === 1 ? 'Forgot password?' : step === 2 ? 'Enter verification code' : 'Create new password'}
          </Text>
          <Text style={[Typography.bodyLg, { color: colors.onSurfaceVariant, marginTop: Spacing.sm, marginBottom: Spacing['3xl'] }]}>
            {step === 1
              ? "Enter your phone number and we'll send a verification code."
              : step === 2
              ? `We sent a 6-digit code to ${phone}`
              : 'Choose a strong password for your account.'}
          </Text>

          {step === 1 && (
            <>
              <Input label="Phone Number" value={phone} onChangeText={setPhone} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" leftIcon={<Phone size={20} color={colors.onSurfaceVariant} />} />
              {error ? <Text style={[Typography.bodySm, { color: colors.error, marginBottom: Spacing.lg }]}>{error}</Text> : null}
              <Button title="Send Verification Code" onPress={handleSendOtp} loading={loading} fullWidth size="lg" />
            </>
          )}

          {step === 2 && (
            <>
              <OTPInput length={6} value={otp} onChange={setOtp} />
              {error ? <Text style={[Typography.bodySm, { color: colors.error, marginTop: Spacing.lg }]}>{error}</Text> : null}
              <Button title="Verify Code" onPress={handleVerifyOtp} fullWidth size="lg" style={{ marginTop: Spacing['3xl'] }} />
              <View style={styles.resendRow}>
                <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant }]}>Didn't receive it? </Text>
                {resendTimer > 0 ? (
                  <Text style={[Typography.titleSm, { color: colors.onSurfaceVariant }]}>Resend in {resendTimer}s</Text>
                ) : (
                  <TouchableOpacity onPress={async () => { await authAPI.forgotPassword(phone.trim()); startResendTimer(); }}>
                    <Text style={[Typography.titleSm, { color: colors.primary }]}>Resend</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Input label="New Password" value={newPassword} onChangeText={setNewPassword} placeholder="Min. 6 characters" isPassword leftIcon={<Lock size={20} color={colors.onSurfaceVariant} />} />
              <Input label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter password" isPassword leftIcon={<Lock size={20} color={colors.onSurfaceVariant} />} />
              {error ? <Text style={[Typography.bodySm, { color: colors.error, marginBottom: Spacing.lg }]}>{error}</Text> : null}
              <Button title="Reset Password" onPress={handleResetPassword} loading={loading} fullWidth size="lg" />
            </>
          )}

          <TouchableOpacity style={styles.backToLogin} onPress={() => navigation.navigate('Login')}>
            <Text style={[Typography.titleSm, { color: colors.primary }]}>← Back to Sign In</Text>
          </TouchableOpacity>
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
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginTop: Spacing.md },
  stepDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepLine: { flex: 1, height: 2, marginHorizontal: Spacing.xs, marginTop: 14 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing['2xl'] },
  backToLogin: { alignItems: 'center', marginTop: Spacing['4xl'] },
});
