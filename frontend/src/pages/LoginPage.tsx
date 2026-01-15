import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Car, Wallet, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPages.module.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'user' | 'agency') => {
    if (type === 'user') {
      setEmail('user@test.com');
      setPassword('password123');
    } else {
      setEmail('wanderlust@agency.com');
      setPassword('password123');
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
              Sign in to find rides, join trips, and travel with your community.
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Car size={20} />
                </div>
                <div>
                  <h4>Pool Rides</h4>
                  <p>Share vehicles for intercity travel</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Wallet size={20} />
                </div>
                <div>
                  <h4>Save 40%</h4>
                  <p>Average savings on every trip</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Shield size={20} />
                </div>
                <div>
                  <h4>Verified Hosts</h4>
                  <p>Travel with trusted community</p>
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
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={styles.input}
                    required
                  />
                </div>
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
                    className={styles.input}
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
            </form>

            {/* Demo Credentials */}
            <div className={styles.demoSection}>
              <div className={styles.demoHeader}>
                <Sparkles size={16} />
                <span>Quick Demo Access</span>
              </div>
              <div className={styles.demoButtons}>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('user')}
                  className={styles.demoBtn}
                >
                  <span className={styles.demoIcon}>🎒</span>
                  <div>
                    <span className={styles.demoLabel}>Traveler</span>
                    <span className={styles.demoEmail}>user@test.com</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('agency')}
                  className={styles.demoBtn}
                >
                  <span className={styles.demoIcon}>🚐</span>
                  <div>
                    <span className={styles.demoLabel}>Trip Host</span>
                    <span className={styles.demoEmail}>wanderlust@agency.com</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
