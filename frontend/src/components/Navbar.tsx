import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, LayoutDashboard, Home, Plus, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <motion.div
            className={styles.logoIcon}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Users size={22} strokeWidth={2.5} />
          </motion.div>
          <div className={styles.logoTextWrapper}>
            <span className={styles.logoText}>Pool<span className={styles.logoAccent}>Trip</span></span>
            <span className={styles.logoTagline}>Travel Together</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          <Link
            to="/"
            className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
          >
            <Home size={18} />
            Explore
          </Link>
          
          {isAuthenticated ? (
            <>
              {user?.role === 'AGENCY' && (
                <Link
                  to="/dashboard"
                  className={`${styles.navLink} ${location.pathname === '/dashboard' ? styles.active : ''}`}
                >
                  <LayoutDashboard size={18} />
                  My Trips
                </Link>
              )}
              
              {user?.role === 'AGENCY' && (
                <Link to="/dashboard" className={styles.postTripBtn}>
                  <Plus size={18} />
                  Post a Trip
                </Link>
              )}
              
              <div className={styles.userMenu}>
                <button className={styles.userButton}>
                  <div className={styles.avatar}>
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className={styles.userName}>{user?.fullName?.split(' ')[0]}</span>
                </button>
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownAvatar}>
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className={styles.dropdownInfo}>
                      <span className={styles.dropdownName}>{user?.fullName}</span>
                      <span className={styles.dropdownRole}>
                        {user?.role === 'AGENCY' ? '🚐 Trip Host' : '🎒 Traveler'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <button onClick={handleLogout} className={styles.dropdownItem}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.loginBtn}>
                Sign In
              </Link>
              <Link to="/register" className={styles.registerBtn}>
                <span>Start Pooling</span>
                <motion.span
                  className={styles.btnArrow}
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                >
                  →
                </motion.span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.mobileToggle}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to="/"
              className={styles.mobileLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home size={20} />
              Explore Trips
            </Link>
            
            {isAuthenticated ? (
              <>
                {user?.role === 'AGENCY' && (
                  <Link
                    to="/dashboard"
                    className={styles.mobileLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={20} />
                    My Trips
                  </Link>
                )}
                <div className={styles.mobileUserInfo}>
                  <div className={styles.mobileAvatar}>
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className={styles.mobileUserName}>{user?.fullName}</span>
                    <span className={styles.mobileUserRole}>
                      {user?.role === 'AGENCY' ? '🚐 Trip Host' : '🎒 Traveler'}
                    </span>
                  </div>
                </div>
                <button onClick={handleLogout} className={styles.mobileLogout}>
                  <LogOut size={20} />
                  Sign Out
                </button>
              </>
            ) : (
              <div className={styles.mobileAuth}>
                <Link
                  to="/login"
                  className={styles.mobileLoginBtn}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={styles.mobileRegisterBtn}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start Pooling →
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
