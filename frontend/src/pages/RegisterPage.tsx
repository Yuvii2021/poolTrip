import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, Building2, MessageSquare, MapPin, Car, Compass, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import styles from './AuthPages.module.css';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'USER' as UserRole,
    agencyName: '',
    agencyDescription: '',
    whatsappNumber: '',
    city: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
              Join the
              <span className={styles.brandingTitleGradient}> Community</span>
            </h1>
            <p className={styles.brandingSubtitle}>
              Start pooling trips and saving money. Whether you're a traveler or a trip host, we've got you covered.
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Car size={20} />
                </div>
                <div>
                  <h4>For Travelers</h4>
                  <p>Find rides & join group trips</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Compass size={20} />
                </div>
                <div>
                  <h4>For Trip Hosts</h4>
                  <p>Post trips & fill your seats</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4>Save Together</h4>
                  <p>Split costs with pooling</p>
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
              <h2 className={styles.formTitle}>Create Account</h2>
              <p className={styles.formSubtitle}>
                Already pooling?{' '}
                <Link to="/login" className={styles.link}>Sign in</Link>
              </p>
            </div>

            {/* Role Selection */}
            <div className={styles.roleSelector}>
              <button
                type="button"
                className={`${styles.roleBtn} ${formData.role === 'USER' ? styles.roleActive : ''}`}
                onClick={() => handleRoleChange('USER')}
              >
                <User size={20} />
                <span>🎒 Traveler</span>
              </button>
              <button
                type="button"
                className={`${styles.roleBtn} ${formData.role === 'AGENCY' ? styles.roleActive : ''}`}
                onClick={() => handleRoleChange('AGENCY')}
              >
                <Building2 size={20} />
                <span>🚐 Trip Host</span>
              </button>
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

              <div className={styles.inputRow}>
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
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <div className={styles.inputWrapper}>
                    <Phone size={18} className={styles.inputIcon} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={styles.input}
                      required
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className={styles.input}
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
              </div>

              {/* Agency/Host Fields */}
              <AnimatePresence>
                {formData.role === 'AGENCY' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={styles.agencyFields}
                  >
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Business/Host Name</label>
                      <div className={styles.inputWrapper}>
                        <Building2 size={18} className={styles.inputIcon} />
                        <input
                          type="text"
                          name="agencyName"
                          value={formData.agencyName}
                          onChange={handleChange}
                          placeholder="Your Business Name"
                          className={styles.input}
                          required={formData.role === 'AGENCY'}
                        />
                      </div>
                    </div>

                    <div className={styles.inputRow}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>WhatsApp Number</label>
                        <div className={styles.inputWrapper}>
                          <MessageSquare size={18} className={styles.inputIcon} />
                          <input
                            type="tel"
                            name="whatsappNumber"
                            value={formData.whatsappNumber}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            className={styles.input}
                          />
                        </div>
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
                  </motion.div>
                )}
              </AnimatePresence>

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
                    Start Pooling
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>

              <p className={styles.terms}>
                By creating an account, you agree to our{' '}
                <a href="#">Terms of Service</a> and{' '}
                <a href="#">Privacy Policy</a>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
