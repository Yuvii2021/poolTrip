import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { packageAPI } from '../services/api';
import { PackageTypeOption } from '../types';
import { 
  Menu, X, ChevronDown, User, LogOut, 
  Compass, PlusCircle, CheckCircle2, Calendar
} from 'lucide-react';
import styles from './Navbar.module.css';

const destinations = [
  { name: 'Kashmir', slug: 'kashmir', emoji: '🪷' },
  { name: 'Goa', slug: 'goa', emoji: '🌊' },
  { name: 'Kerala', slug: 'kerala', emoji: '🛶' },
  { name: 'Rajasthan', slug: 'rajasthan', emoji: '🕌' },
  { name: 'Ladakh', slug: 'ladakh', emoji: '⛰️' },
  { name: 'Andaman', slug: 'andaman', emoji: '🏝️' },
  { name: 'Sikkim', slug: 'sikkim', emoji: '🍃' },
  { name: 'Himachal', slug: 'himachal', emoji: '🏔️' },
];

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [packageTypes, setPackageTypes] = useState<PackageTypeOption[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // When mobile menu is open, don't let "outside" logic fight mobile dropdown toggles.
      // Instead, only close the mobile menu if the click is truly outside it.
      if (isMobileMenuOpen) {
        const clickedInsideMobileMenu = mobileMenuRef.current?.contains(target) ?? false;
        const clickedMobileMenuBtn = mobileMenuBtnRef.current?.contains(target) ?? false;
        if (!clickedInsideMobileMenu && !clickedMobileMenuBtn) {
          setIsMobileMenuOpen(false);
          setActiveDropdown(null);
        }
        return;
      }

      const isOutsideNavLinks = dropdownRef.current ? !dropdownRef.current.contains(target) : true;
      const isOutsideUserDropdown = userDropdownRef.current ? !userDropdownRef.current.contains(target) : true;

      // Only close if clicking outside both dropdown areas
      if (isOutsideNavLinks && isOutsideUserDropdown) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const options = await packageAPI.getFilterOptions();
      setPackageTypes(options.packageTypes || []);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const isHomePage = location.pathname === '/';
  const navbarClass = `${styles.navbar} ${isScrolled || !isHomePage ? styles.scrolled : ''}`;

  const verificationPercent = (() => {
    if (!user) return 0;
    const steps = 4;
    let done = 0;
    if (user.phoneVerified !== false) done++; // phone is verified at registration
    if (user.emailVerified) done++;
    if (user.profilePhoto && user.profilePhoto.trim().length > 0) done++;
    if (user.bio && user.bio.trim().length > 0) done++;
    return Math.round((done * 100) / steps);
  })();
  const isFullyVerified = verificationPercent >= 100;

  return (
    <nav className={navbarClass}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Compass size={24} />
          </div>
          <span className={styles.logoText}>
            <span className={styles.logoMain}>Pool</span>
            <span className={styles.logoAccent}>MyTrips</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.navLinks} ref={dropdownRef}>
          <Link to="/" className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}>
            Home
          </Link>

          {/* Destinations Dropdown */}
          <div className={styles.dropdown}>
            <button 
              className={`${styles.navLink} ${styles.dropdownTrigger}`}
              onClick={() => setActiveDropdown(activeDropdown === 'destinations' ? null : 'destinations')}
            >
              Destinations <ChevronDown size={16} className={activeDropdown === 'destinations' ? styles.rotated : ''} />
            </button>
            {activeDropdown === 'destinations' && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownGrid}>
                  {destinations.map((dest) => (
                    <Link 
                      key={dest.slug} 
                      to={`/destinations/${dest.slug}`} 
                      className={styles.dropdownItem}
                    >
                      <span className={styles.dropdownEmoji}>{dest.emoji}</span>
                      <span>{dest.name}</span>
                    </Link>
                  ))}
                </div>
                <div className={styles.dropdownFooter}>
                  <Link to="/destinations" className={styles.viewAllLink}>
                    View All Destinations <ChevronDown size={14} className={styles.rotatedRight} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Categories Dropdown */}
          <div className={styles.dropdown}>
            <button 
              className={`${styles.navLink} ${styles.dropdownTrigger}`}
              onClick={() => setActiveDropdown(activeDropdown === 'categories' ? null : 'categories')}
            >
              Categories <ChevronDown size={16} className={activeDropdown === 'categories' ? styles.rotated : ''} />
            </button>
            {activeDropdown === 'categories' && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownGrid}>
                  {packageTypes.map((cat) => (
                    <Link 
                      key={cat.value} 
                      to={`/categories/${cat.value}`} 
                      className={styles.dropdownItem}
                    >
                      <span className={styles.dropdownEmoji}>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </Link>
                  ))}
                </div>
                <div className={styles.dropdownFooter}>
                  <Link to="/categories" className={styles.viewAllLink}>
                    View All Categories <ChevronDown size={14} className={styles.rotatedRight} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className={styles.navActions}>
          <Link 
            to={user ? "/dashboard?action=create" : "/login?redirect=create"} 
            className={styles.publishBtn}
          >
            <PlusCircle size={18} />
            <span>Publish a Trip</span>
          </Link>

          {user ? (
            <div className={styles.dropdown} ref={userDropdownRef}>
              <button 
                className={styles.userBtn}
                onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
              >
                <span className={styles.userAvatarBtn}>
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt="" className={styles.userAvatarImg} />
                  ) : (
                    <span className={styles.userAvatarInitial}>
                      {user.fullName.trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                  {isFullyVerified && (
                    <span className={styles.verifiedDot}>
                      <CheckCircle2 size={12} />
                    </span>
                  )}
                </span>
                <span>{user.fullName.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </button>

              {activeDropdown === 'user' && (
                <div className={`${styles.dropdownMenu} ${styles.userMenu}`}>
                  {/* User header */}
                  <div className={styles.userMenuHeader}>
                    <div className={styles.userMenuAvatar}>
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt="" className={styles.userMenuAvatarImg} />
                      ) : (
                        <span className={styles.userMenuAvatarInitial}>
                          {user.fullName.trim().charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className={styles.userMenuInfo}>
                      <div className={styles.userMenuName}>{user.fullName}</div>
                      <div className={styles.userMenuEmail}>{user.email}</div>
                    </div>
                  </div>

                  {/* Verification progress — compact bar */}
                  {!isFullyVerified && (
                    <Link
                      to="/profile"
                      className={styles.verifyBar}
                      onClick={() => setActiveDropdown(null)}
                    >
                      <div className={styles.verifyBarTop}>
                        <span className={styles.verifyBarLabel}>Profile {verificationPercent}% complete</span>
                        <span className={styles.verifyBarAction}>Complete &rarr;</span>
                      </div>
                      <div className={styles.verifyBarTrack}>
                        <div className={styles.verifyBarFill} style={{ width: `${verificationPercent}%` }} />
                      </div>
                    </Link>
                  )}

                  <div className={styles.userMenuLinks}>
                    <Link 
                      to="/profile" 
                      className={styles.dropdownItem}
                      onClick={() => setActiveDropdown(null)}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link 
                      to="/dashboard" 
                      className={styles.dropdownItem}
                      onClick={() => setActiveDropdown(null)}
                    >
                      <Compass size={16} />
                      <span>Dashboard</span>
                    </Link>
                    <Link 
                      to="/my-bookings" 
                      className={styles.dropdownItem}
                      onClick={() => setActiveDropdown(null)}
                    >
                      <Calendar size={16} />
                      <span>My Bookings</span>
                    </Link>
                  </div>

                  <div className={styles.userMenuFooter}>
                    <button 
                      onClick={() => {
                        setActiveDropdown(null);
                        logout();
                      }} 
                      className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    >
                      <LogOut size={16} />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.loginBtn}>
              Login
            </Link>
          )}
        </div>

        {/* Mobile Quick Actions (visible on mobile) */}
        <div className={styles.mobileQuickActions}>
          <Link
            to={user ? "/dashboard?action=create" : "/login?redirect=create"}
            className={styles.mobileIconBtn}
            aria-label="Publish a trip"
          >
            <PlusCircle size={20} />
          </Link>
          {user ? (
            <Link to="/dashboard" className={styles.mobileIconBtn} aria-label="Dashboard">
              <User size={20} />
            </Link>
          ) : (
            <Link to="/login" className={styles.mobileIconBtn} aria-label="Login">
              <User size={20} />
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className={styles.mobileMenuBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          ref={mobileMenuBtnRef}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu} ref={mobileMenuRef}>
          {user && (
            <div className={styles.mobileUserCard}>
              <div className={styles.mobileUserName}>{user.fullName}</div>
              <div className={styles.mobileUserMeta}>{user.phone}</div>
            </div>
          )}

          <Link to="/" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          
          <div className={styles.mobileDropdown}>
            <button 
              className={styles.mobileNavLink}
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'mobile-dest' ? null : 'mobile-dest')}
            >
              Destinations <ChevronDown size={16} className={activeDropdown === 'mobile-dest' ? styles.rotated : ''} />
            </button>
            {activeDropdown === 'mobile-dest' && (
              <div className={styles.mobileSubmenu}>
                {destinations.map((dest) => (
                  <Link
                    key={dest.slug}
                    to={`/destinations/${dest.slug}`}
                    className={styles.mobileSubLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {dest.emoji} {dest.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className={styles.mobileDropdown}>
            <button 
              className={styles.mobileNavLink}
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'mobile-cat' ? null : 'mobile-cat')}
            >
              Categories <ChevronDown size={16} className={activeDropdown === 'mobile-cat' ? styles.rotated : ''} />
            </button>
            {activeDropdown === 'mobile-cat' && (
              <div className={styles.mobileSubmenu}>
                {packageTypes.map((cat) => (
                  <Link
                    key={cat.value}
                    to={`/categories/${cat.value}`}
                    className={styles.mobileSubLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {cat.icon} {cat.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link 
            to={user ? "/dashboard?action=create" : "/login?redirect=create"} 
            className={styles.mobilePublishBtn}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <PlusCircle size={18} />
            Publish a Trip
          </Link>

          <div className={styles.mobileActions}>
            {user ? (
              <>
                <Link to="/profile" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                <Link to="/my-bookings" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>My Bookings</Link>
                <Link to="/dashboard" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                    setActiveDropdown(null);
                  }}
                  className={styles.mobileNavLink}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={styles.mobileLoginBtn} onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
