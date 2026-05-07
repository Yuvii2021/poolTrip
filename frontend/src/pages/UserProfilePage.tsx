import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Phone, MessageCircle, MapPin, Package } from 'lucide-react';
import { authAPI, packageAPI } from '../services/api';
import { PackageCard } from '../components/PackageCard';
import { TravelPackage } from '../types';
import styles from './UserProfilePage.module.css';

interface PublicUser {
  id: number;
  fullName: string;
  phone: string;
  whatsappNumber: string;
  bio: string;
  rating: number;
  reviewCount: number;
  numberOfTrips: number;
  profilePhoto: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
}

export const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) loadProfile(Number(id));
  }, [id]);

  const loadProfile = async (userId: number) => {
    setLoading(true);
    setError('');
    try {
      const [userData, pkgs] = await Promise.all([
        authAPI.getUserById(userId),
        packageAPI.getPackagesByUserId(userId),
      ]);
      setUser(userData);
      setPackages(pkgs);
    } catch {
      setError('Could not load this profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <span>Loading profile…</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p>{error || 'User not found.'}</p>
          <button className={styles.retryBtn} onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const isVerified = user.phoneVerified && user.emailVerified;
  const ratingValid = typeof user.rating === 'number' && user.rating > 0;
  const hasAnyRating = typeof user.rating === 'number';

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.avatar}>
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.fullName} className={styles.avatarImg} />
            ) : (
              user.fullName.trim().charAt(0).toUpperCase()
            )}
          </div>

          <div className={styles.heroInfo}>
            <h1 className={styles.heroName}>
              {user.fullName}
              {isVerified && <CheckCircle2 size={20} className={styles.verifiedBadge} />}
            </h1>

            {user.bio && <p className={styles.heroBio}>{user.bio}</p>}

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <Star size={16} fill={ratingValid ? 'currentColor' : 'none'} color="#f59e0b" />
                {ratingValid ? (
                  <>
                    <span className={styles.statValue}>{user.rating.toFixed(1)}/5</span>
                    <span>({user.reviewCount} {user.reviewCount === 1 ? 'rating' : 'ratings'})</span>
                  </>
                ) : (
                  <span style={{ color: 'var(--color-text-muted)' }}>No ratings yet</span>
                )}
              </div>
              <div className={styles.stat}>
                <Package size={16} />
                <span className={styles.statValue}>{packages.length}</span>
                <span>trips listed</span>
              </div>
              {user.numberOfTrips > 0 && (
                <div className={styles.stat}>
                  <MapPin size={16} />
                  <span className={styles.statValue}>{user.numberOfTrips}</span>
                  <span>trips completed</span>
                </div>
              )}
            </div>

            <div className={styles.contactRow}>
              {user.phone && (
                <a href={`tel:${user.phone}`} className={`${styles.contactChip} ${styles.phoneChip}`}>
                  <Phone size={14} /> {user.phone}
                </a>
              )}
              {user.whatsappNumber && (
                <a
                  href={`https://wa.me/${user.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.contactChip} ${styles.whatsappChip}`}
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Packages */}
      <section className={styles.body}>
        <h2 className={styles.sectionTitle}>Trips by {user.fullName.split(' ')[0]}</h2>
        {packages.length === 0 ? (
          <p className={styles.emptyPackages}>No trips listed yet.</p>
        ) : (
          <div className={styles.packagesGrid}>
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
