import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket, Clock, CheckCircle2, XCircle, X, MapPin, Calendar,
  Users, Phone, MessageCircle, Loader2, ChevronRight, Star, Send
} from 'lucide-react';
import { bookingAPI } from '../services/api';
import { BookingResponse, BookingStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/error';
import styles from './MyBookingsPage.module.css';

type TabType = 'all' | 'confirmed' | 'pending' | 'past';

const canRate = (booking: BookingResponse): boolean => {
  if (booking.status !== 'CONFIRMED') return false;
  if (booking.rating !== null && booking.rating !== undefined) return false;
  if (!booking.packageStartDate) return true; // no date set, allow rating
  return new Date(booking.packageStartDate) <= new Date();
};

export const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Rating state
  const [ratingBookingId, setRatingBookingId] = useState<number | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadBookings = async () => {
    try {
      const data = await bookingAPI.getMyBookings();
      setBookings(data);
      setActionNotice(null);
    } catch (err) {
      console.error('Error loading bookings', err);
      setActionNotice({
        type: 'error',
        message: getApiErrorMessage(err, 'Could not load bookings. Kripya page refresh karein.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      await bookingAPI.cancelBooking(bookingId);
      setActionNotice({
        type: 'success',
        message: 'Booking cancelled successfully. Aapki booking cancel ho gayi hai.',
      });
      await loadBookings();
    } catch (err: unknown) {
      setActionNotice({
        type: 'error',
        message: getApiErrorMessage(err, 'Failed to cancel booking. Kripya dubara try karein.'),
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleSubmitRating = async (bookingId: number) => {
    if (ratingValue === 0) return;
    setRatingLoading(true);
    try {
      await bookingAPI.rateBooking(bookingId, ratingValue, reviewText || undefined);
      setRatingBookingId(null);
      setRatingValue(0);
      setRatingHover(0);
      setReviewText('');
      setActionNotice({
        type: 'success',
        message: 'Thanks for your rating! Aapka feedback save ho gaya.',
      });
      await loadBookings();
    } catch (err: unknown) {
      setActionNotice({
        type: 'error',
        message: getApiErrorMessage(err, 'Failed to submit rating. Kripya fir se try karein.'),
      });
    } finally {
      setRatingLoading(false);
    }
  };

  const openRating = (bookingId: number) => {
    setRatingBookingId(bookingId);
    setRatingValue(0);
    setRatingHover(0);
    setReviewText('');
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'confirmed') return b.status === 'CONFIRMED';
    if (activeTab === 'pending') return b.status === 'PENDING';
    if (activeTab === 'past') return b.status === 'REJECTED' || b.status === 'CANCELLED';
    return true;
  });

  const statusConfig: Record<BookingStatus, { icon: React.ReactNode; label: string; className: string }> = {
    CONFIRMED: { icon: <CheckCircle2 size={16} />, label: 'Confirmed', className: styles.statusConfirmed },
    PENDING: { icon: <Clock size={16} />, label: 'Pending Approval', className: styles.statusPending },
    REJECTED: { icon: <XCircle size={16} />, label: 'Rejected', className: styles.statusRejected },
    CANCELLED: { icon: <X size={16} />, label: 'Cancelled', className: styles.statusCancelled },
  };

  const counts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    past: bookings.filter(b => b.status === 'REJECTED' || b.status === 'CANCELLED').length,
  };

  if (authLoading || loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 size={32} className={styles.spinning} />
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <h1><Ticket size={28} /> My Bookings</h1>
        <p>Track all your trip reservations</p>
      </div>
      {actionNotice && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: actionNotice.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: actionNotice.type === 'success' ? '#166534' : '#991b1b',
            border: actionNotice.type === 'success' ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(239,68,68,0.25)',
            fontWeight: 500,
          }}
        >
          {actionNotice.message}
        </div>
      )}

      <div className={styles.tabs}>
        {(['all', 'confirmed', 'pending', 'past'] as TabType[]).map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            <span className={styles.tabLabel}>{tab === 'past' ? 'Past' : tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            <span className={styles.tabCount}>{counts[tab]}</span>
          </button>
        ))}
      </div>

      <div className={styles.bookingsList}>
        {filteredBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <Ticket size={48} />
            <h3>No bookings yet</h3>
            <p>When you book a trip, it will appear here.</p>
            <button onClick={() => navigate('/')} className={styles.browseBtn}>
              Browse Trips
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {filteredBookings.map((booking, index) => {
              const sc = statusConfig[booking.status];
              const showRatable = canRate(booking);
              const isRating = ratingBookingId === booking.id;
              const alreadyRated = booking.rating !== null && booking.rating !== undefined;

              return (
                <motion.div
                  key={booking.id}
                  className={styles.bookingCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardImage}>
                      {booking.packageImage ? (
                        <img src={booking.packageImage} alt={booking.packageTitle} />
                      ) : (
                        <div className={styles.cardImagePlaceholder}>
                          <MapPin size={24} />
                        </div>
                      )}
                    </div>
                    <div className={styles.cardInfo}>
                      <Link to={`/package/${booking.packageId}`} className={styles.cardTitle}>
                        {booking.packageTitle}
                        <ChevronRight size={16} />
                      </Link>
                      <div className={styles.cardMeta}>
                        <span><MapPin size={14} /> {booking.packageOrigin} → {booking.packageDestination}</span>
                        {booking.packageStartDate && (
                          <span><Calendar size={14} /> {new Date(booking.packageStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        )}
                        <span><Users size={14} /> {booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}</span>
                      </div>
                      {booking.transportationLabel && (
                        <span className={styles.transportTag}>
                          {booking.transportationIcon || '🚗'} {booking.transportationLabel}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.statusBadge} ${sc.className}`}>
                      {sc.icon}
                      <span>{sc.label}</span>
                    </div>
                  </div>

                  {booking.message && (
                    <div className={styles.cardMessage}>
                      <MessageCircle size={14} />
                      <span>{booking.message}</span>
                    </div>
                  )}

                  {/* Already rated display */}
                  {alreadyRated && (
                    <div className={styles.ratedSection}>
                      <div className={styles.ratedStars}>
                        <span className={styles.ratedLabel}>Your rating</span>
                        <div className={styles.starRow}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={16}
                              className={s <= (booking.rating ?? 0) ? styles.starFilled : styles.starEmpty}
                              fill={s <= (booking.rating ?? 0) ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      {booking.review && (
                        <p className={styles.ratedReview}>"{booking.review}"</p>
                      )}
                    </div>
                  )}

                  {/* Rating prompt */}
                  {showRatable && !isRating && (
                    <div className={styles.ratePrompt}>
                      <Star size={16} className={styles.ratePromptIcon} />
                      <span>Trip completed! How was your experience?</span>
                      <button className={styles.ratePromptBtn} onClick={() => openRating(booking.id)}>
                        Rate Trip
                      </button>
                    </div>
                  )}

                  {/* Rating form (inline) */}
                  {isRating && (
                    <div className={styles.ratingForm}>
                      <div className={styles.ratingFormHeader}>
                        <span>Rate your trip to {booking.packageDestination}</span>
                        <button className={styles.ratingFormClose} onClick={() => setRatingBookingId(null)}>
                          <X size={16} />
                        </button>
                      </div>
                      <div className={styles.ratingStarPicker}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            className={styles.ratingStarBtn}
                            onMouseEnter={() => setRatingHover(s)}
                            onMouseLeave={() => setRatingHover(0)}
                            onClick={() => setRatingValue(s)}
                          >
                            <Star
                              size={28}
                              className={s <= (ratingHover || ratingValue) ? styles.starFilled : styles.starEmpty}
                              fill={s <= (ratingHover || ratingValue) ? 'currentColor' : 'none'}
                            />
                          </button>
                        ))}
                        {ratingValue > 0 && (
                          <span className={styles.ratingLabel}>
                            {['', 'Poor', 'Fair', 'Good', 'Great', 'Amazing'][ratingValue]}
                          </span>
                        )}
                      </div>
                      <textarea
                        className={styles.reviewTextarea}
                        placeholder="Share your experience (optional)..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={3}
                        maxLength={500}
                      />
                      <div className={styles.ratingFormActions}>
                        <button
                          className={styles.submitRatingBtn}
                          disabled={ratingValue === 0 || ratingLoading}
                          onClick={() => handleSubmitRating(booking.id)}
                        >
                          {ratingLoading ? <Loader2 size={16} className={styles.spinning} /> : <Send size={16} />}
                          Submit Rating
                        </button>
                      </div>
                    </div>
                  )}

                  <div className={styles.cardBottom}>
                    <div className={styles.hostInfo}>
                      {booking.hostPhoto ? (
                        <img src={booking.hostPhoto} alt={booking.hostName} className={styles.hostAvatar} />
                      ) : (
                        <div className={styles.hostAvatarFallback}>{booking.hostName.charAt(0).toUpperCase()}</div>
                      )}
                      <div>
                        <span className={styles.hostName}>Hosted by {booking.hostName}</span>
                        <span className={styles.bookingDate}>Booked {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && booking.hostPhone && (
                        <a href={`tel:${booking.hostPhone}`} className={styles.actionBtn} title="Call host">
                          <Phone size={15} />
                        </a>
                      )}
                      {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && booking.hostWhatsapp && (
                        <a
                          href={`https://wa.me/${booking.hostWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${booking.hostName}! Regarding my booking for "${booking.packageTitle}".`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.actionBtnWhatsapp}
                          title="WhatsApp host"
                        >
                          <MessageCircle size={15} />
                        </a>
                      )}
                      {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                        <button
                          className={styles.actionBtnCancel}
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          title="Cancel booking"
                        >
                          {cancellingId === booking.id ? <Loader2 size={15} className={styles.spinning} /> : <X size={15} />}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};
