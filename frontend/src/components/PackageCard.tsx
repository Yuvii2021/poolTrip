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

const packageTypeEmojis: Record<string, string> = {
  ADVENTURE: '🏔️',
  BEACH: '🏖️',
  CULTURAL: '🏛️',
  HONEYMOON: '💑',
  FAMILY: '👨‍👩‍👧‍👦',
  PILGRIMAGE: '🛕',
  WILDLIFE: '🦁',
  CRUISE: '🚢',
  LUXURY: '💎',
  BUDGET: '💰',
};

const vehicleIcons: Record<string, React.ReactNode> = {
  CAR: <Car size={14} />,
  BUS: <Bus size={14} />,
  MINI_BUS: <Bus size={14} />,
  TEMPO: <Car size={14} />,
  SUV: <Car size={14} />,
};

const defaultImages: Record<string, string> = {
  ADVENTURE: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
  BEACH: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  CULTURAL: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
  HONEYMOON: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  FAMILY: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800',
  PILGRIMAGE: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800',
  WILDLIFE: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
  CRUISE: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800',
  LUXURY: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
  BUDGET: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
};

export const PackageCard = ({ pkg, index = 0, featured = false }: PackageCardProps) => {
  const hasDiscount = pkg.discountedPrice && pkg.discountedPrice < pkg.price;
  const discountPercent = hasDiscount
    ? Math.round(((pkg.price - pkg.discountedPrice!) / pkg.price) * 100)
    : 0;

  const imageUrl = pkg.coverImage || defaultImages[pkg.packageType] || defaultImages.ADVENTURE;
  
  const filledSeats = pkg.totalSeats - pkg.availableSeats;
  const fillPercent = (filledSeats / pkg.totalSeats) * 100;
  
  // Generate seat dots (max 10 for display)
  const displaySeats = Math.min(pkg.totalSeats, 10);
  const displayFilled = Math.round((filledSeats / pkg.totalSeats) * displaySeats);

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
            src={imageUrl}
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
          
          {/* Type Badge */}
          <div className={styles.typeBadge}>
            <span className={styles.typeEmoji}>{packageTypeEmojis[pkg.packageType]}</span>
            <span>{pkg.packageType}</span>
          </div>

          {/* Vehicle Badge if available */}
          {pkg.vehicleType && (
            <div className={styles.vehicleBadge}>
              {vehicleIcons[pkg.vehicleType]}
              <span>{pkg.vehicleType.replace('_', ' ')}</span>
            </div>
          )}
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
            <div className={styles.metaItem}>
              <Calendar size={14} />
              <span>{pkg.durationDays}D / {pkg.durationNights || pkg.durationDays - 1}N</span>
            </div>
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
