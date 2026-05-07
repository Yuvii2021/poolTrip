import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Users, Star, Clock, Phone, MessageCircle,
  ChevronLeft, ChevronRight, Check, X, Shield, FileText, Sparkles,
  Camera, Images, CheckCircle2, ExternalLink, Car,
  Zap, UserCheck, Minus, Plus, Loader2, AlertCircle, Ticket
} from 'lucide-react';
import { packageAPI, bookingAPI } from '../services/api';
import { TravelPackage, BookingResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { getApiErrorMessage } from '../utils/error';
import styles from './PackageDetailPage.module.css';


// Helper function to parse inclusions/exclusions (comma-separated string or array)
const parseList = (data: string | string[] | undefined, fallback: string[]): string[] => {
  if (!data) return fallback;
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    return data.split(',').map(item => item.trim()).filter(Boolean);
  }
  return fallback;
};

// Helper function to parse itinerary (JSON string or array)
const parseItinerary = (data: string | string[] | undefined, fallback: string[]): string[] => {
  if (!data) return fallback;
  if (Array.isArray(data)) {
    // If it's an array of objects with day/description, extract descriptions
    if (data.length > 0 && typeof data[0] === 'object') {
      return data.map((item: any) => item.description || item.title || JSON.stringify(item));
    }
    return data;
  }
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => 
          typeof item === 'object' 
            ? `${item.title || ''}: ${item.description || ''}`.trim()
            : item
        );
      }
    } catch {
      // If not valid JSON, split by comma
      return data.split(',').map(item => item.trim()).filter(Boolean);
    }
  }
  return fallback;
};

// Helper function to check if a string is a valid media URL or base64
const isValidMedia = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  return trimmed.startsWith('http://') || 
         trimmed.startsWith('https://') || 
         trimmed.startsWith('data:image/');
};

// Helper to detect if a URL is a video (Cloudinary video URLs contain /video/upload/)
const isVideoUrl = (url: string): boolean => {
  const lower = url.toLowerCase();
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  return videoExtensions.some(ext => lower.includes(ext)) || lower.includes('/video/');
};

// Helper function to parse media (comma-separated string or array)
const parseMedia = (media: string | string[] | undefined): string[] => {
  if (!media) return [];
  
  if (Array.isArray(media)) {
    return media.filter(url => isValidMedia(url));
  }
  
  if (typeof media === 'string') {
    try {
      const parsed = JSON.parse(media);
      if (Array.isArray(parsed)) {
        return parsed.filter((url: string) => isValidMedia(url));
      }
    } catch {
      if (!media.startsWith('data:image/')) {
        return media.split(',').map(url => url.trim()).filter(url => isValidMedia(url));
      } else if (isValidMedia(media)) {
        return [media];
      }
    }
  }
  
  return [];
};

export const PackageDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [pkg, setPkg] = useState<TravelPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'terms'>('overview');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Booking state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSeats, setBookingSeats] = useState(1);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<BookingResponse | null>(null);
  const [existingBooking, setExistingBooking] = useState<BookingResponse | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts or id changes
    window.scrollTo(0, 0);
    
    if (id) {
      loadPackage(parseInt(id));
    }
  }, [id]);

  // Check existing booking status when package loads
  useEffect(() => {
    if (pkg && isAuthenticated) {
      checkBookingStatus();
    }
  }, [pkg?.id, isAuthenticated]);

  const checkBookingStatus = async () => {
    if (!pkg) return;
    try {
      const status = await bookingAPI.getBookingStatus(pkg.id);
      setExistingBooking(status);
    } catch {
      setExistingBooking(null);
    }
  };

  const handleBookSeats = async () => {
    if (!pkg) return;
    const tripDate = pkg.startDate ? new Date(pkg.startDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (tripDate && tripDate < today) {
      setBookingError('This trip has already started. Yeh trip start ho chuki hai.');
      return;
    }
    if (bookingSeats < 1 || bookingSeats > pkg.availableSeats) {
      setBookingError(`Please select seats between 1 and ${pkg.availableSeats}.`);
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    try {
      const response = await bookingAPI.createBooking({
        packageId: pkg.id,
        seats: bookingSeats,
        message: bookingMessage || undefined,
      });
      setBookingSuccess(response);
      setExistingBooking(response);
      // Reload package to get updated seat count
      loadPackage(pkg.id);
    } catch (err: unknown) {
      setBookingError(
        getApiErrorMessage(
          err,
          'Booking failed. Please try again. Agar issue aaye toh host ko WhatsApp karein.',
        ),
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!existingBooking) return;
    setCancellingBooking(true);
    try {
      await bookingAPI.cancelBooking(existingBooking.id);
      setExistingBooking(null);
      setBookingSuccess(null);
      // Reload package to get updated seat count
      if (pkg) loadPackage(pkg.id);
    } catch (err: unknown) {
      setBookingError(
        getApiErrorMessage(
          err,
          'Could not cancel booking right now. Kripya thodi der baad dubara try karein.',
        ),
      );
    } finally {
      setCancellingBooking(false);
    }
  };

  const isOwnPackage = user && pkg && user.id === pkg.userId;

  const loadPackage = async (packageId: number) => {
    try {
      const data = await packageAPI.getPackageById(packageId);
      setPkg(data);
    } catch (error) {
      console.error('Error loading package:', error);
    } finally {
      setLoading(false);
    }
  };

  // Separate images (for hero slider) from all media (for gallery)
  const allMedia = pkg ? parseMedia(pkg.media) : [];
  const heroImages = allMedia.filter(url => !isVideoUrl(url));

  // Auto-slide hero images every 4 seconds
  const resetHeroTimer = useCallback(() => {
    if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    if (heroImages.length > 1) {
      heroTimerRef.current = setInterval(() => {
        setHeroSlideIndex(prev => (prev + 1) % heroImages.length);
      }, 4000);
    }
  }, [heroImages.length]);

  useEffect(() => {
    resetHeroTimer();
    return () => { if (heroTimerRef.current) clearInterval(heroTimerRef.current); };
  }, [resetHeroTimer]);

  const goToHeroSlide = (index: number) => {
    setHeroSlideIndex(index);
    resetHeroTimer();
  };

  const nextHeroSlide = () => {
    setHeroSlideIndex(prev => (prev + 1) % heroImages.length);
    resetHeroTimer();
  };

  const prevHeroSlide = () => {
    setHeroSlideIndex(prev => (prev - 1 + heroImages.length) % heroImages.length);
    resetHeroTimer();
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading package details...</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className={styles.errorState}>
        <h2>Package not found</h2>
        <p>The package you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className={styles.backBtn}>
          Go Back Home
        </button>
      </div>
    );
  }

  const hasDiscount = pkg.discountedPrice && pkg.discountedPrice < pkg.price;
  const discountPercent = hasDiscount
    ? Math.round(((pkg.price - pkg.discountedPrice!) / pkg.price) * 100)
    : 0;

  return (
    <motion.div 
      className={styles.page}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Hero Section — Image Slider */}
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          {heroImages.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={heroSlideIndex}
                src={heroImages[heroSlideIndex]}
                alt={`${pkg.title} - ${heroSlideIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>
          ) : (
            <ImagePlaceholder
              destination={pkg.destination}
              packageType={pkg.packageTypeLabel || pkg.packageType}
              size="hero"
            />
          )}
          <div className={styles.heroOverlay} />

          {/* Slider controls */}
          {heroImages.length > 1 && (
            <>
              <button className={`${styles.sliderBtn} ${styles.sliderBtnPrev}`} onClick={prevHeroSlide}>
                <ChevronLeft size={22} />
              </button>
              <button className={`${styles.sliderBtn} ${styles.sliderBtnNext}`} onClick={nextHeroSlide}>
                <ChevronRight size={22} />
              </button>
              <div className={styles.imageCounter}>
                <Images size={14} />
                {heroSlideIndex + 1} / {heroImages.length}
              </div>
              <div className={styles.sliderDots}>
                {heroImages.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.dot} ${i === heroSlideIndex ? styles.dotActive : ''}`}
                    onClick={() => goToHeroSlide(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className={styles.heroContent}>
          <motion.button
            className={styles.backButton}
            onClick={() => navigate(-1)}
            whileHover={{ x: -5 }}
          >
            <ChevronLeft size={20} />
            Back
          </motion.button>

          <div className={styles.heroInfo}>
            <div className={styles.heroBadges}>
              <span className={styles.typeBadge}>
                {pkg.packageTypeIcon || '📦'} {pkg.packageTypeLabel || pkg.packageType}
              </span>
              {pkg.featured && (
                <span className={styles.featuredBadge}>
                  <Sparkles size={14} /> Featured
                </span>
              )}
              {hasDiscount && (
                <span className={styles.discountBadge}>{discountPercent}% OFF</span>
              )}
            </div>

            <h1 className={styles.heroTitle}>{pkg.title}</h1>

            <div className={styles.heroMeta}>
              <div className={styles.heroMetaItem}>
                <MapPin size={18} />
                <span>{pkg.destination}</span>
              </div>
              <div className={styles.heroMetaItem}>
                <Calendar size={18} />
                <span>{pkg.durationDays}D / {pkg.durationNights || pkg.durationDays - 1}N</span>
              </div>
              <div className={styles.heroMetaItem}>
                <Star size={18} fill="currentColor" />
                <span>
                  {pkg.rating && pkg.rating > 0
                    ? `${pkg.rating.toFixed(1)} (${pkg.reviewCount || 0} reviews)`
                    : 'No reviews yet'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.content}>
        <div className={styles.mainContent}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FileText size={18} />
              Overview
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'itinerary' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('itinerary')}
            >
              <Clock size={18} />
              Itinerary
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'terms' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('terms')}
            >
              <Shield size={18} />
              Terms & Policies
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.overview}
              >
                {/* Description */}
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <Camera size={20} />
                    About This Trip
                  </h3>
                  <p className={styles.description}>
                    {pkg.description || 'Experience an unforgettable journey with this carefully curated travel package. Perfect for those seeking adventure, relaxation, and cultural immersion.'}
                  </p>
                </div>

                {/* Media Gallery */}
                {allMedia.length > 0 && (
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                      <Images size={20} />
                      Gallery
                    </h3>
                    <div className={styles.photoGallery}>
                      {allMedia.map((url, index) => (
                        <motion.div
                          key={index}
                          className={styles.galleryImage}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => openLightbox(index)}
                          style={{ position: 'relative' }}
                        >
                          {isVideoUrl(url) ? (
                            <video 
                              src={url} 
                              muted 
                              preload="metadata"
                              onError={(e) => {
                                (e.target as HTMLVideoElement).style.display = 'none';
                                (e.target as HTMLVideoElement).parentElement!.style.display = 'none';
                              }}
                            />
                          ) : (
                            <img 
                              src={url} 
                              alt={`${pkg.title} - Photo ${index + 1}`}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                              }}
                            />
                          )}
                          {isVideoUrl(url) && (
                            <span style={{
                              position: 'absolute', top: 8, left: 8,
                              background: 'rgba(0,0,0,0.7)', color: '#fff',
                              padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600
                            }}>▶ VID</span>
                          )}
                          <div className={styles.galleryOverlay}>
                            <Camera size={24} />
                            <span>View</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inclusions */}
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <Check size={20} />
                    What's Included
                  </h3>
                  <div className={styles.listGrid}>
                    {parseList(pkg.inclusions, [
                      'Accommodation in premium hotels',
                      'Daily breakfast and dinner',
                      'Airport transfers',
                      'Guided sightseeing tours',
                      'Entry fees to attractions',
                      'Travel insurance'
                    ]).map((item, i) => (
                      <div key={i} className={styles.listItem}>
                        <Check size={16} className={styles.checkIcon} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exclusions */}
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <X size={20} />
                    What's Not Included
                  </h3>
                  <div className={styles.listGrid}>
                    {parseList(pkg.exclusions, [
                      'Airfare / Train tickets',
                      'Personal expenses',
                      'Lunch',
                      'Tips and gratuities'
                    ]).map((item, i) => (
                      <div key={i} className={styles.listItemExclude}>
                        <X size={16} className={styles.xIcon} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'itinerary' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.itinerary}
              >
                {parseItinerary(pkg.itinerary, [
                  'Day 1: Arrival and check-in at the hotel. Evening at leisure.',
                  'Day 2: Full day sightseeing tour of local attractions.',
                  'Day 3: Adventure activities and cultural experiences.',
                  'Day 4: Free day for shopping and exploration.',
                  'Day 5: Check-out and departure.'
                ]).map((day, i) => (
                  <div key={i} className={styles.itineraryDay}>
                    <div className={styles.dayNumber}>
                      <span>Day</span>
                      <strong>{i + 1}</strong>
                    </div>
                    <div className={styles.dayContent}>
                      <p>{day}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'terms' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.terms}
              >
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <Shield size={20} />
                    Cancellation Policy
                  </h3>
                  <p className={styles.policyText}>
                    {pkg.cancellationPolicy || 'Not provided by host.'}
                  </p>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <FileText size={20} />
                    Terms & Conditions
                  </h3>
                  <p className={styles.policyText}>
                    {pkg.termsAndConditions || 'Not provided by host.'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {/* Price Card */}
          <div className={styles.priceCard}>
            <div className={styles.pricing}>
              {hasDiscount && (
                <div className={styles.discountRow}>
                  <span className={styles.originalPrice}>₹{pkg.price.toLocaleString()}</span>
                  <span className={styles.saveBadge}>Save ₹{(pkg.price - pkg.discountedPrice!).toLocaleString()}</span>
                </div>
              )}
              <div className={styles.currentPrice}>
                <span className={styles.priceValue}>
                  ₹{(hasDiscount ? pkg.discountedPrice! : pkg.price).toLocaleString()}
                </span>
                <span className={styles.priceLabel}>per person</span>
              </div>
            </div>

            <div className={styles.tripDetails}>
              <div className={styles.tripDetailItem}>
                <div className={styles.tripDetailIcon}>
                  <Users size={16} />
                </div>
                <div className={styles.tripDetailText}>
                  <span className={styles.tripDetailValue}>{pkg.availableSeats} seats available</span>
                  <span className={styles.tripDetailSub}>out of {pkg.totalSeats} total</span>
                </div>
              </div>
              {pkg.startDate && (
                <div className={styles.tripDetailItem}>
                  <div className={styles.tripDetailIcon}>
                    <Calendar size={16} />
                  </div>
                  <div className={styles.tripDetailText}>
                    <span className={styles.tripDetailValue}>
                      Starts {new Date(pkg.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className={styles.tripDetailSub}>{pkg.durationDays}D / {pkg.durationNights || pkg.durationDays - 1}N trip</span>
                  </div>
                </div>
              )}
              {pkg.origin && (
                <div className={styles.tripDetailItem}>
                  <div className={styles.tripDetailIcon}>
                    <MapPin size={16} />
                  </div>
                  <div className={styles.tripDetailText}>
                    <span className={styles.tripDetailValue}>{pkg.origin}</span>
                    <span className={styles.tripDetailSub}>Starting from</span>
                  </div>
                </div>
              )}
              {(pkg.transportationLabel || pkg.transportation || pkg.vehicleType) && (
                <div className={styles.tripDetailItem}>
                  <div className={styles.tripDetailIcon}>
                    {pkg.transportationIcon ? (
                      <span style={{ fontSize: '16px' }}>{pkg.transportationIcon}</span>
                    ) : (
                      <Car size={16} />
                    )}
                  </div>
                  <div className={styles.tripDetailText}>
                    <span className={styles.tripDetailValue}>
                      {pkg.transportationLabel || pkg.transportation || pkg.vehicleType}
                    </span>
                    <span className={styles.tripDetailSub}>Transport</span>
                  </div>
                </div>
              )}
            </div>

          </div>

            {/* Booking Section */}
            <div className={styles.bookingSection}>
              {existingBooking ? (
                <div className={styles.existingBooking}>
                  <div className={styles.bookingStatusBanner} data-status={existingBooking.status}>
                    {existingBooking.status === 'CONFIRMED' && <CheckCircle2 size={18} />}
                    {existingBooking.status === 'PENDING' && <Clock size={18} />}
                    {existingBooking.status === 'REJECTED' && <X size={18} />}
                    {existingBooking.status === 'CANCELLED' && <X size={18} />}
                    <span>
                      {existingBooking.status === 'CONFIRMED' && `Booking Confirmed · ${existingBooking.seatsBooked} seat${existingBooking.seatsBooked > 1 ? 's' : ''}`}
                      {existingBooking.status === 'PENDING' && `Booking Pending · ${existingBooking.seatsBooked} seat${existingBooking.seatsBooked > 1 ? 's' : ''}`}
                      {existingBooking.status === 'REJECTED' && 'Booking Rejected'}
                      {existingBooking.status === 'CANCELLED' && 'Booking Cancelled'}
                    </span>
                  </div>
                  {(existingBooking.status === 'CONFIRMED' || existingBooking.status === 'PENDING') && (
                    <button
                      className={styles.cancelBookingBtn}
                      onClick={handleCancelBooking}
                      disabled={cancellingBooking}
                    >
                      {cancellingBooking ? <Loader2 size={16} className={styles.spinning} /> : <X size={16} />}
                      Cancel Booking
                    </button>
                  )}
                </div>
              ) : isOwnPackage ? (
                <div className={styles.ownPackageNote}>
                  <Ticket size={16} />
                  <span>This is your package</span>
                </div>
              ) : pkg.availableSeats > 0 ? (
                <button
                  className={styles.bookSeatBtn}
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate(`/login?redirect=${encodeURIComponent(`/package/${pkg.id}`)}`);
                      return;
                    }
                    setBookingModalOpen(true);
                    setBookingSeats(1);
                    setBookingMessage('');
                    setBookingError('');
                    setBookingSuccess(null);
                  }}
                >
                  {pkg.instantBooking !== false ? (
                    <>
                      <Zap size={18} />
                      Book Seats Instantly
                    </>
                  ) : (
                    <>
                      <UserCheck size={18} />
                      Request to Book
                    </>
                  )}
                </button>
              ) : (
                <button className={styles.bookSeatBtn} disabled>
                  <Users size={18} />
                  Fully Booked
                </button>
              )}
              {pkg.instantBooking !== false ? (
                <p className={styles.bookingModeHint}>
                  <Zap size={13} /> Instant confirmation
                </p>
              ) : (
                <p className={styles.bookingModeHint}>
                  <UserCheck size={13} /> Host approval required
                </p>
              )}
            </div>

          {/* Posted By Card */}
          {pkg.postedByName && (
            <div className={styles.postedByCard}>
              <div className={styles.postedByHeader}>
                <span className={styles.postedByLabel}>Posted by</span>
              </div>

              <div className={styles.userProfileSection}>
                <Link to={`/user/${pkg.userId}`} className={styles.userProfileLink}>
                  {pkg.postedByPhoto ? (
                    <img
                      src={pkg.postedByPhoto}
                      alt={pkg.postedByName}
                      className={styles.userAvatar}
                    />
                  ) : (
                    <div className={styles.userAvatarFallback}>
                      {pkg.postedByName.trim().charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className={styles.userInfo}>
                    <div className={styles.userNameRow}>
                      <h4 className={styles.userName}>{pkg.postedByName}</h4>
                      {pkg.postedByVerified && (
                        <CheckCircle2 size={16} className={styles.verifiedIcon} />
                      )}
                    </div>

                    {pkg.rating && pkg.rating > 0 ? (
                      <div className={styles.userRating}>
                        <div className={styles.ratingStars}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={13}
                              fill={star <= Math.round(pkg.rating!) ? 'currentColor' : 'none'}
                              className={star <= Math.round(pkg.rating!) ? styles.starFilled : styles.starEmpty}
                            />
                          ))}
                        </div>
                        <span className={styles.ratingText}>
                          {pkg.rating.toFixed(1)}/5
                          {pkg.reviewCount ? ` · ${pkg.reviewCount} rating${pkg.reviewCount > 1 ? 's' : ''}` : ''}
                        </span>
                      </div>
                    ) : (
                      <span className={styles.noRating}>No ratings yet</span>
                    )}
                  </div>

                  <ExternalLink size={14} className={styles.profileArrow} />
                </Link>
              </div>

              {/* Verified Badge */}
              {pkg.postedByVerified && (
                <div className={styles.verifiedBadge}>
                  <Shield size={14} />
                  <span>Verified Profile</span>
                </div>
              )}

              {/* Vehicle Info */}
              {(pkg.transportationLabel || pkg.transportation) && (
                <div className={styles.vehicleInfo}>
                  {pkg.transportationIcon ? (
                    <span style={{ fontSize: '16px' }}>{pkg.transportationIcon}</span>
                  ) : (
                    <Car size={16} />
                  )}
                  <span>{pkg.transportationLabel || pkg.transportation}</span>
                </div>
              )}

              {/* Contact User Directly */}
              <div className={styles.userContactActions}>
                {pkg.agencyPhone && (
                  <a href={`tel:${pkg.agencyPhone}`} className={styles.userContactBtn}>
                    <Phone size={15} />
                    <span>Contact {pkg.postedByName.split(' ')[0]}</span>
                  </a>
                )}
                {pkg.agencyWhatsapp && (
                  <a
                    href={`https://wa.me/${pkg.agencyWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${pkg.postedByName.split(' ')[0]}! I'm interested in your "${pkg.title}" trip.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.userWhatsappBtn}
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </aside>
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingModalOpen && (
          <motion.div
            className={styles.bookingOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !bookingLoading && setBookingModalOpen(false)}
          >
            <motion.div
              className={styles.bookingModal}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {bookingSuccess ? (
                <div className={styles.bookingSuccessContent}>
                  <div className={styles.successIcon}>
                    {bookingSuccess.status === 'CONFIRMED' ? (
                      <CheckCircle2 size={48} />
                    ) : (
                      <Clock size={48} />
                    )}
                  </div>
                  <h3>{bookingSuccess.status === 'CONFIRMED' ? 'Booking Confirmed!' : 'Request Sent!'}</h3>
                  <p>
                    {bookingSuccess.status === 'CONFIRMED'
                      ? `Your ${bookingSuccess.seatsBooked} seat${bookingSuccess.seatsBooked > 1 ? 's' : ''} on "${pkg.title}" ${bookingSuccess.seatsBooked > 1 ? 'are' : 'is'} confirmed.`
                      : `Your request for ${bookingSuccess.seatsBooked} seat${bookingSuccess.seatsBooked > 1 ? 's' : ''} has been sent to ${pkg.postedByName || 'the host'}. You'll be notified once they respond.`}
                  </p>
                  <div className={styles.successActions}>
                    <button
                      className={styles.successBtn}
                      onClick={() => setBookingModalOpen(false)}
                    >
                      Done
                    </button>
                    <button
                      className={styles.successBtnOutline}
                      onClick={() => navigate('/my-bookings')}
                    >
                      View My Bookings
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.bookingModalHeader}>
                    <h3>
                      {pkg.instantBooking !== false ? (
                        <><Zap size={20} /> Book Seats</>
                      ) : (
                        <><UserCheck size={20} /> Request to Book</>
                      )}
                    </h3>
                    <button
                      className={styles.bookingModalClose}
                      onClick={() => setBookingModalOpen(false)}
                      disabled={bookingLoading}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className={styles.bookingModalBody}>
                    <div className={styles.bookingTripSummary}>
                      <strong>{pkg.title}</strong>
                      <span>{pkg.origin} → {pkg.destination}</span>
                      <span>{pkg.startDate && new Date(pkg.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {pkg.durationDays}D</span>
                    </div>

                    <div className={styles.seatSelector}>
                      <label>Number of seats</label>
                      <div className={styles.seatControls}>
                        <button
                          onClick={() => setBookingSeats(Math.max(1, bookingSeats - 1))}
                          disabled={bookingSeats <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className={styles.seatCount}>{bookingSeats}</span>
                        <button
                          onClick={() => setBookingSeats(Math.min(pkg.availableSeats, bookingSeats + 1))}
                          disabled={bookingSeats >= pkg.availableSeats}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className={styles.seatsAvailableNote}>{pkg.availableSeats} available</span>
                    </div>

                    <div className={styles.bookingMessageField}>
                      <label>Message to host (optional)</label>
                      <textarea
                        value={bookingMessage}
                        onChange={(e) => setBookingMessage(e.target.value)}
                        placeholder="Introduce yourself or ask a question..."
                        rows={3}
                        maxLength={500}
                      />
                    </div>

                    <div className={styles.bookingPriceSummary}>
                      <div className={styles.bookingPriceRow}>
                        <span>₹{(pkg.discountedPrice || pkg.price).toLocaleString()} × {bookingSeats} seat{bookingSeats > 1 ? 's' : ''}</span>
                        <span className={styles.bookingTotalPrice}>₹{((pkg.discountedPrice || pkg.price) * bookingSeats).toLocaleString()}</span>
                      </div>
                      <p className={styles.noPaymentNote}>No online payment · Pay directly to host</p>
                    </div>

                    {bookingError && (
                      <div className={styles.bookingErrorMsg}>
                        <AlertCircle size={16} />
                        <span>{bookingError}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.bookingModalFooter}>
                    <button
                      className={styles.confirmBookingBtn}
                      onClick={handleBookSeats}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? (
                        <><Loader2 size={18} className={styles.spinning} /> Booking...</>
                      ) : pkg.instantBooking !== false ? (
                        <><Zap size={18} /> Confirm Booking</>
                      ) : (
                        <><UserCheck size={18} /> Send Request</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button className={styles.lightboxClose} onClick={closeLightbox}>
              <X size={24} />
            </button>
            
            <motion.div
              className={styles.lightboxContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {isVideoUrl(allMedia[lightboxIndex]) ? (
                <video
                  key={allMedia[lightboxIndex]}
                  src={allMedia[lightboxIndex]}
                  controls
                  autoPlay
                  style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }}
                />
              ) : (
                <img src={allMedia[lightboxIndex]} alt={`${pkg.title} - Photo ${lightboxIndex + 1}`} />
              )}
              
              {allMedia.length > 1 && (
                <>
                  <button className={`${styles.lightboxNav} ${styles.lightboxPrev}`} onClick={prevImage}>
                    <ChevronLeft size={32} />
                  </button>
                  <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={nextImage}>
                    <ChevronRight size={32} />
                  </button>
                  
                  <div className={styles.lightboxCounter}>
                    {lightboxIndex + 1} / {allMedia.length}
                  </div>
                </>
              )}
            </motion.div>

            {/* Thumbnail Strip */}
            {allMedia.length > 1 && (
              <div className={styles.lightboxThumbs}>
                {allMedia.map((url, index) => (
                  <button
                    key={index}
                    className={`${styles.thumb} ${index === lightboxIndex ? styles.thumbActive : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(index);
                    }}
                  >
                    {isVideoUrl(url) ? (
                      <video src={url} muted preload="metadata" />
                    ) : (
                      <img src={url} alt={`Thumbnail ${index + 1}`} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


