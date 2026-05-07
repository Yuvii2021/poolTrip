import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, User, Phone, MapPin, Car, Compass, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { getApiErrorMessage } from '../utils/error';
import styles from './AuthPages.module.css';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    city: '',
    whatsappNumber: '',
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 10);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'whatsappNumber') {
      setFormData({ ...formData, [name]: formatPhoneNumber(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setOtp(''); // Clear OTP when moving to OTP screen
    setSuccessMessage(''); // Clear any previous success messages
    setLoading(true);

    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      await authAPI.sendOtp(cleanPhone);
      setStep('otp');
      setSuccessMessage('OTP has been sent to your phone number');
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
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

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);

    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      await authAPI.sendOtp(cleanPhone);
      setSuccessMessage('OTP has been resent to your phone number');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to resend OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSuccessMessage(''); // Clear success message
    
    // Validate OTP is entered
    const currentOtp = otp || '';
    const trimmedOtp = currentOtp.trim();

    if (!trimmedOtp || trimmedOtp.length === 0) {
      setFieldErrors({ Otp: 'Otp is required' });
      setError('Please enter the OTP');
      return;
    }
    
    setLoading(true);

    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      
      // Build register data matching backend RegisterRequest DTO exactly
      // Ensure Otp is explicitly set and not undefined/null
      const registerData: {
        email: string;
        password: string;
        fullName: string;
        phone: string;
        Otp: string;
        whatsappNumber?: string;
      } = {
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: cleanPhone,
        Otp: trimmedOtp, // Must match backend field name exactly (capital O) - explicitly set
      };
      
      // Add whatsappNumber only if provided
      if (formData.whatsappNumber && formData.whatsappNumber.trim().length > 0) {
        registerData.whatsappNumber = formData.whatsappNumber.replace(/\D/g, '');
      }
      
      // Verify Otp is still present before sending
      if (!registerData.Otp || registerData.Otp.trim().length === 0) {
        throw new Error('OTP is missing from registration data');
      }
      
      await register({
        email: registerData.email,
        password: registerData.password,
        fullName: registerData.fullName,
        phone: registerData.phone,
        Otp: registerData.Otp, // Explicitly pass Otp to ensure it's not lost
        whatsappNumber: registerData.whatsappNumber,
        role: 'USER' as const, // This is for frontend context, not sent to backend
        city: formData.city, // This is for frontend context, not sent to backend
      });
      navigate('/');
    } catch (err: unknown) {
      const errorData = (err as any)?.response?.data;
      if (errorData?.errors && typeof errorData.errors === 'object') {
        setFieldErrors(errorData.errors as Record<string, string>);
      }
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
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
              {step === 'form' ? (
                <>Join the<span className={styles.brandingTitleGradient}> Adventure</span></>
              ) : (
                <>Verify Your<span className={styles.brandingTitleGradient}> Phone</span></>
              )}
            </h1>
            <p className={styles.brandingSubtitle}>
              {step === 'form' 
                ? 'Create an account to discover trips, publish your own adventures, and connect with fellow travelers.'
                : 'Enter the OTP sent to your phone number to complete registration.'}
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Car size={20} />
                </div>
                <div>
                  <h4>Find Trips</h4>
                  <p>Discover amazing group adventures</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Compass size={20} />
                </div>
                <div>
                  <h4>Publish Trips</h4>
                  <p>Share your trips with others</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4>Save Money</h4>
                  <p>Pool trips & split costs</p>
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
          <div className={`${styles.formContainer} ${styles.registerForm}`}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>
                {step === 'form' ? 'Create Account' : 'Verify OTP'}
              </h2>
              <p className={styles.formSubtitle}>
                {step === 'form' ? (
                  <>Already pooling?{' '}<Link to="/login" className={styles.link}>Sign in</Link></>
                ) : (
                  <>Enter the OTP sent to {formData.phone}</>
                )}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Registration Form */}
              {step === 'form' && (
                <motion.form
                  key="form"
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
                    <label className={styles.label}>Full Name</label>
                    <div className={styles.inputWrapper}>
                      <User size={18} className={styles.inputIcon} />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`${styles.input} ${fieldErrors.fullName ? styles.inputError : ''}`}
                        required
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <span className={styles.fieldError}>{fieldErrors.fullName}</span>
                    )}
                  </div>

                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Phone Number</label>
                      <div className={styles.inputWrapper}>
                        <Phone size={18} className={styles.inputIcon} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
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

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>City</label>
                      <div className={styles.inputWrapper}>
                        <MapPin size={18} className={styles.inputIcon} />
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Mumbai"
                          className={styles.input}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Email Address</label>
                    <div className={styles.inputWrapper}>
                      <Mail size={18} className={styles.inputIcon} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                        required
                      />
                    </div>
                    {fieldErrors.email && (
                      <span className={styles.fieldError}>{fieldErrors.email}</span>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.inputWrapper}>
                      <Lock size={18} className={styles.inputIcon} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
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
                    {fieldErrors.password && (
                      <span className={styles.fieldError}>{fieldErrors.password}</span>
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

                  <p className={styles.terms}>
                    By creating an account, you agree to our{' '}
                    <a href="#">Terms of Service</a> and{' '}
                    <a href="#">Privacy Policy</a>
                  </p>
                </motion.form>
              )}

              {/* Step 2: OTP Verification */}
              {step === 'otp' && (
                <motion.form
                  key="otp"
                  onSubmit={handleRegister}
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
                    <label className={styles.label}>Enter OTP</label>
                    <div className={styles.inputWrapper}>
                      <Shield size={18} className={styles.inputIcon} />
                      <input
                        type="text"
                        name="otp"
                        value={otp}
                        onChange={(e) => {
                          const newOtp = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(newOtp);
                          // Clear error when user starts typing
                          if (newOtp.length > 0) {
                            setFieldErrors(prev => {
                              const updated = { ...prev };
                              delete updated.otp;
                              delete updated.Otp;
                              return updated;
                            });
                            if (error && (error.includes('Otp') || error.includes('OTP'))) {
                              setError('');
                            }
                          }
                        }}
                        placeholder="Enter 6-digit OTP"
                        className={`${styles.input} ${fieldErrors.otp || fieldErrors.Otp ? styles.inputError : ''}`}
                        required
                        maxLength={6}
                        autoComplete="one-time-code"
                      />
                    </div>
                    {(fieldErrors.otp || fieldErrors.Otp) && (
                      <span className={styles.fieldError}>{fieldErrors.otp || fieldErrors.Otp}</span>
                    )}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className={styles.resendOtpBtn}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                    <p className={styles.otpHint}>
                      OTP sent to your number. It is valid for a short time.
                    </p>
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('form');
                        setError('');
                        setFieldErrors({});
                        setOtp('');
                      }}
                      className={styles.backBtn}
                    >
                      <ArrowLeft size={18} />
                      Back
                    </button>
                    <motion.button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={loading || !otp || otp.trim().length === 0}
                      whileHover={{ scale: loading || !otp || otp.trim().length === 0 ? 1 : 1.02 }}
                      whileTap={{ scale: loading || !otp || otp.trim().length === 0 ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <div className={styles.spinner} />
                      ) : (
                        <>
                          Register
                          <ArrowRight size={18} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
