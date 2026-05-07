import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import { getApiErrorMessage } from '../utils/error';
import styles from './AuthPages.module.css';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 10);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      await authAPI.forgotPassword(cleanPhone);
      setStep('otp');
      setSuccessMessage('OTP has been sent to your phone number');
    } catch (err: unknown) {
      const errorData = (err as any)?.response?.data;
      if (errorData?.errors && typeof errorData.errors === 'object') {
        setFieldErrors(errorData.errors as Record<string, string>);
      }
      setError(getApiErrorMessage(err, 'Failed to send OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };
    if (otp.trim().length < 4) {
      setError('Please enter a valid OTP.');
      return;
    }


  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      await authAPI.resetPassword(cleanPhone, otp, newPassword);
      setStep('success');
    } catch (err: unknown) {
      const errorData = (err as any)?.response?.data;
      if (errorData?.errors && typeof errorData.errors === 'object') {
        setFieldErrors(errorData.errors as Record<string, string>);
      }
      setError(getApiErrorMessage(err, 'Failed to reset password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      await authAPI.forgotPassword(cleanPhone);
      setSuccessMessage('OTP has been resent to your phone number');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to resend OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.background}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.pattern} />
      </div>

      <div className={styles.container}>
        {/* Left Side - Branding */}
        <motion.div
          className={styles.brandingSide}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Users size={24} />
            </div>
            <div className={styles.logoTextWrapper}>
              <span className={styles.logoText}>Pool<span className={styles.logoAccent}>MyTrips</span></span>
              <span className={styles.logoTagline}>Travel Together</span>
            </div>
          </Link>

          <div className={styles.brandingContent}>
            <h1 className={styles.brandingTitle}>
              Reset Your
              <span className={styles.brandingTitleGradient}> Password</span>
            </h1>
            <p className={styles.brandingSubtitle}>
              {step === 'phone' && 'Enter your phone number to receive an OTP'}
              {step === 'otp' && 'Enter the OTP sent to your phone and set a new password'}
              {step === 'success' && 'Your password has been reset successfully!'}
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Shield size={20} />
                </div>
                <div>
                  <h4>Secure</h4>
                  <p>Your account is protected</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          className={styles.formSide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>
                {step === 'phone' && 'Forgot Password'}
                {step === 'otp' && 'Reset Password'}
                {step === 'success' && 'Success!'}
              </h2>
              <p className={styles.formSubtitle}>
                Remember your password?{' '}
                <Link to="/login" className={styles.link}>Sign in</Link>
              </p>
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Enter Phone Number */}
              {step === 'phone' && (
                <motion.form
                  key="phone"
                  onSubmit={handleSendOtp}
                  className={styles.form}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {error && (
                    <motion.div
                      className={styles.error}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <div className={styles.inputWrapper}>
                      <Phone size={18} className={styles.inputIcon} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="9876543210"
                        className={`${styles.input} ${fieldErrors.phone ? styles.inputError : ''}`}
                        required
                        pattern="[6-9][0-9]{9}"
                        maxLength={10}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <span className={styles.fieldError}>{fieldErrors.phone}</span>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <div className={styles.spinner} />
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}

              {/* Step 2: Enter OTP and New Password */}
              {step === 'otp' && (
                <motion.form
                  key="otp"
                  onSubmit={handleVerifyOtpAndReset}
                  className={styles.form}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {successMessage && (
                    <motion.div
                      className={styles.success}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {successMessage}
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      className={styles.error}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>OTP</label>
                    <div className={styles.inputWrapper}>
                      <Lock size={18} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        className={`${styles.input} ${fieldErrors.otp ? styles.inputError : ''}`}
                        required
                        maxLength={6}
                      />
                    </div>
                    {fieldErrors.otp && (
                      <span className={styles.fieldError}>{fieldErrors.otp}</span>
                    )}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className={styles.resendOtpBtn}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>New Password</label>
                    <div className={styles.inputWrapper}>
                      <Lock size={18} className={styles.inputIcon} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className={`${styles.input} ${fieldErrors.newPassword ? styles.inputError : ''}`}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={styles.passwordToggle}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {fieldErrors.newPassword && (
                      <span className={styles.fieldError}>{fieldErrors.newPassword}</span>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Confirm Password</label>
                    <div className={styles.inputWrapper}>
                      <Lock size={18} className={styles.inputIcon} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className={`${styles.input} ${confirmPassword && newPassword !== confirmPassword ? styles.inputError : ''}`}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={styles.passwordToggle}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <span className={styles.fieldError}>Passwords do not match</span>
                    )}
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className={styles.backBtn}
                    >
                      <ArrowLeft size={18} />
                      Back
                    </button>
                    <motion.button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <div className={styles.spinner} />
                      ) : (
                        <>
                          Reset Password
                          <ArrowRight size={18} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* Step 3: Success */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  className={styles.successContainer}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className={styles.successIcon}>
                    <CheckCircle size={64} />
                  </div>
                  <h3 className={styles.successTitle}>Password Reset Successful!</h3>
                  <p className={styles.successMessage}>
                    Your password has been reset successfully. You can now sign in with your new password.
                  </p>
                  <Link to="/login" className={styles.submitBtn}>
                    Go to Login
                    <ArrowRight size={18} />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
