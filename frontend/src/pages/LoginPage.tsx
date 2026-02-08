import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Phone, Lock, Eye, EyeOff, ArrowRight, Car, Compass, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPages.module.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const redirectTo = searchParams.get('redirect');

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digits.slice(0, 10);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      // Clean phone number before sending
      const cleanPhone = phone.replace(/\D/g, '');
      await login(cleanPhone, password);
      if (redirectTo === 'create') {
        navigate('/dashboard?action=create');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      
      // Extract field-specific errors if available
      if (errorData?.errors) {
        setFieldErrors(errorData.errors);
        // Set main error message from backend or combine field errors
        const errorMessage = errorData.message || 
          Object.values(errorData.errors).join(', ');
        setError(errorMessage);
      } else {
        // Fallback to generic error message
        setError(errorData?.message || 'Invalid credentials. Please try again.');
      }
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
              <span className={styles.logoText}>Pool<span className={styles.logoAccent}>Trip</span></span>
              <span className={styles.logoTagline}>Travel Together</span>
            </div>
          </Link>

          <div className={styles.brandingContent}>
            <h1 className={styles.brandingTitle}>
              Welcome back,
              <span className={styles.brandingTitleGradient}> Traveler</span>
            </h1>
            <p className={styles.brandingSubtitle}>
              Sign in to discover trips, publish your adventures, and connect with fellow travelers.
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Car size={20} />
                </div>
                <div>
                  <h4>Find Trips</h4>
                  <p>Discover amazing adventures</p>
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
                  <Shield size={20} />
                </div>
                <div>
                  <h4>Trusted Community</h4>
                  <p>Travel with verified members</p>
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
              <h2 className={styles.formTitle}>Sign In</h2>
              <p className={styles.formSubtitle}>
                Don't have an account?{' '}
                <Link to="/register" className={styles.link}>Join the Pool</Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
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

              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
                    required
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

              <div className={styles.forgotPasswordLink}>
                <Link to="/forgot-password" className={styles.link}>
                  Forgot Password?
                </Link>
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
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>

              <p className={styles.terms}>
                Don't have an account?{' '}
                <Link to="/register" className={styles.link}>Create one</Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
