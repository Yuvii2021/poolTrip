import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Star, Sparkles, ArrowRight, Clock, Car, Bus, CheckCircle } from 'lucide-react';
import { TravelPackage } from '../types';
import styles from './PackageCard.module.css';

interface PackageCardProps {
  pkg: TravelPackage;
  index?: number;
  featured?: boolean;
}

// Helper function to get vehicle icon - uses backend icon if available, otherwise determines from type
const getVehicleIcon = (transportationIcon?: string, transportationType?: string): React.ReactNode => {
  // If backend provides icon emoji, use it
  if (transportationIcon) {
    return <span style={{ fontSize: '14px' }}>{transportationIcon}</span>;
  }
  
  // Fallback: determine icon component based on transportation type prefix
  if (!transportationType) return <Car size={14} />;
  
  const upperType = transportationType.toUpperCase();
  if (upperType.startsWith('BUS')) {
    return <Bus size={14} />;
  } else if (upperType.startsWith('CAR') || upperType.startsWith('SUV') || upperType.startsWith('TEMPO')) {
    return <Car size={14} />;
  } else {
    return <Car size={14} />; // Default icon
  }
};

export const PackageCard = ({ pkg, index = 0, featured = false }: PackageCardProps) => {
  const hasDiscount = pkg.discountedPrice && pkg.discountedPrice < pkg.price;
  const discountPercent = hasDiscount
    ? Math.round(((pkg.price - pkg.discountedPrice!) / pkg.price) * 100)
    : 0;

  // Use coverImage from backend, fallback to first image, then undefined (let CSS handle default)
  const imageUrl = pkg.coverImage || (pkg.images && pkg.images.length > 0 ? pkg.images[0] : undefined);
  
  const filledSeats = pkg.totalSeats - pkg.availableSeats;
  const fillPercent = (filledSeats / pkg.totalSeats) * 100;
  
  // Generate seat dots (max 10 for display)
  const displaySeats = Math.min(pkg.totalSeats, 10);
  const displayFilled = Math.round((filledSeats / pkg.totalSeats) * displaySeats);
  
  // Get transportation value (backend sends 'transportation', frontend might use 'vehicleType')
  const transportationValue = pkg.transportation || pkg.vehicleType;
  console.log(transportationValue);
  // Debug: Log transportation value to verify it's being received
  if (process.env.NODE_ENV === 'development' && !transportationValue) {
    console.log('Package missing transportation:', { 
      id: pkg.id, 
      title: pkg.title, 
      transportation: pkg.transportation, 
      vehicleType: pkg.vehicleType 
    });
  }

  return (
    <motion.div
      className={`${styles.card} ${featured ? styles.featured : ''}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/package/${pkg.id}`} className={styles.cardLink}>
        {/* Image Section */}
        <div className={styles.imageWrapper}>
          <img
            src={imageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E'}
            alt={pkg.title}
            className={styles.image}
            loading="lazy"
          />
          <div className={styles.imageOverlay} />
          
          {/* Badges */}
          <div className={styles.topBadges}>
            {pkg.featured && (
              <span className={styles.featuredBadge}>
                <Sparkles size={12} />
                Featured
              </span>
            )}
            {hasDiscount && (
              <span className={styles.discountBadge}>
                {discountPercent}% OFF
              </span>
            )}
          </div>
          
          {/* Type Badge - Always show, prioritize backend data */}
          <div className={styles.typeBadge}>
            <span className={styles.typeEmoji}>{pkg.packageTypeIcon || '📦'}</span>
            <span>{pkg.packageTypeLabel || pkg.packageType}</span>
          </div>

          {/* Vehicle Badge - Show if transportation data exists */}
          {(pkg.transportationIcon || pkg.transportationLabel || transportationValue) && (
            <div className={styles.vehicleBadge}>
              {pkg.transportationIcon ? (
                <span style={{ fontSize: '14px' }}>{pkg.transportationIcon}</span>
              ) : (
                getVehicleIcon(undefined, transportationValue)
              )}
              <span>{pkg.transportationLabel || transportationValue}</span>
            </div>
          )}
          
          {/* Duration Badge - Make it more visible */}
          <div className={styles.durationBadge}>
            <Calendar size={12} />
            <span>{pkg.durationDays}D/{pkg.durationNights || pkg.durationDays - 1}N</span>
          </div>
        </div>

        {/* Content Section */}
        <div className={styles.content}>
          {/* Route Header */}
          <div className={styles.routeHeader}>
            {pkg.origin && (
              <div className={styles.route}>
                <span className={styles.routeFrom}>{pkg.origin}</span>
                <ArrowRight size={14} className={styles.routeArrow} />
                <span className={styles.routeTo}>{pkg.destination}</span>
              </div>
            )}
            {!pkg.origin && (
              <div className={styles.location}>
                <MapPin size={14} />
                <span>{pkg.destination}</span>
              </div>
            )}
            {pkg.rating && (
              <div className={styles.rating}>
                <Star size={12} fill="currentColor" />
                <span>{pkg.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className={styles.title}>{pkg.title}</h3>

          {/* Meta Info */}
          <div className={styles.meta}>
            {(pkg.transportationIcon || pkg.transportationLabel || transportationValue) && (
              <div className={styles.metaItem}>
                {pkg.transportationIcon ? (
                  <span style={{ fontSize: '14px' }}>{pkg.transportationIcon}</span>
                ) : (
                  getVehicleIcon(undefined, transportationValue)
                )}
                <span>{pkg.transportationLabel || transportationValue}</span>
              </div>
            )}
            {pkg.startDate && (
              <div className={styles.metaItem}>
                <Clock size={14} />
                <span>{new Date(pkg.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Seat Visualization */}
          <div className={styles.seatsSection}>
            <div className={styles.seatsHeader}>
              <div className={styles.seatsInfo}>
                <Users size={14} />
                <span>{filledSeats}/{pkg.totalSeats} pooled</span>
              </div>
              {fillPercent >= 70 && (
                <span className={styles.fillingFast}>Filling Fast!</span>
              )}
            </div>
            <div className={styles.seatsBar}>
              <motion.div
                className={styles.seatsProgress}
                initial={{ width: 0 }}
                animate={{ width: `${fillPercent}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
            <div className={styles.seatDots}>
              {[...Array(displaySeats)].map((_, i) => (
                <div
                  key={i}
                  className={`${styles.seatDot} ${i < displayFilled ? styles.seatFilled : ''}`}
                />
              ))}
              {pkg.totalSeats > 10 && (
                <span className={styles.moreDots}>+{pkg.totalSeats - 10}</span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <div className={styles.pricing}>
              {hasDiscount && (
                <span className={styles.originalPrice}>
                  ₹{pkg.price.toLocaleString()}
                </span>
              )}
              <div className={styles.priceRow}>
                <span className={styles.price}>
                  ₹{(hasDiscount ? pkg.discountedPrice! : pkg.price).toLocaleString()}
                </span>
                <span className={styles.perPerson}>/person</span>
              </div>
              {hasDiscount && (
                <span className={styles.savingsTag}>
                  Save ₹{(pkg.price - pkg.discountedPrice!).toLocaleString()}
                </span>
              )}
            </div>
            <motion.button
              className={styles.joinBtn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Join Pool</span>
              <ArrowRight size={16} />
            </motion.button>
          </div>

          {/* Verified Host Badge */}
          {pkg.isVerified && (
            <div className={styles.verifiedBadge}>
              <CheckCircle size={12} />
              <span>Verified Host</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};
