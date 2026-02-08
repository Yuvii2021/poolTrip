import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Building, 
  Star, MessageSquare, Edit2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import styles from './ProfilePage.module.css';

interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  whatsappNumber: string;
  rating: number;
  reviewCount: number;
}

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await authAPI.getCurrentUser();
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p className={styles.error}>{error}</p>
          <button onClick={fetchProfile} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>Manage your account information and preferences</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          className={styles.profileCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              <User size={48} />
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>{profile?.fullName || authUser?.fullName}</h2>
              <p className={styles.profileEmail}>{profile?.email || authUser?.email}</p>
              {profile && (
                <div className={styles.ratingSection}>
                  <div className={styles.ratingBadge}>
                    <div className={styles.ratingStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          className={`${styles.star} ${
                            star <= Math.round(profile.rating || 0) ? styles.starFilled : styles.starEmpty
                          }`}
                          fill={star <= Math.round(profile.rating || 0) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <div className={styles.ratingValue}>
                      <span className={styles.ratingNumber}>
                        {profile.rating != null ? profile.rating.toFixed(1) : '0.0'}
                      </span>
                      {profile.reviewCount != null && profile.reviewCount > 0 && (
                        <span className={styles.reviewCount}>
                          ({profile.reviewCount} {profile.reviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                      )}
                      {(!profile.reviewCount || profile.reviewCount === 0) && (
                        <span className={styles.noReviews}>No reviews yet</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className={styles.details}>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <Mail size={20} />
              </div>
              <div className={styles.detailContent}>
                <label className={styles.detailLabel}>Email</label>
                <p className={styles.detailValue}>{profile?.email || authUser?.email}</p>
              </div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <Phone size={20} />
              </div>
              <div className={styles.detailContent}>
                <label className={styles.detailLabel}>Phone Number</label>
                <p className={styles.detailValue}>{profile?.phone || authUser?.phone}</p>
              </div>
            </div>

            {profile?.whatsappNumber && (
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                  <MessageSquare size={20} />
                </div>
                <div className={styles.detailContent}>
                  <label className={styles.detailLabel}>WhatsApp Number</label>
                  <p className={styles.detailValue}>{profile.whatsappNumber}</p>
                </div>
              </div>
            )}

            {authUser?.role === 'AGENCY' && authUser?.agencyName && (
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                  <Building size={20} />
                </div>
                <div className={styles.detailContent}>
                  <label className={styles.detailLabel}>Agency Name</label>
                  <p className={styles.detailValue}>{authUser.agencyName}</p>
                </div>
              </div>
            )}

            {authUser?.city && (
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                  <MapPin size={20} />
                </div>
                <div className={styles.detailContent}>
                  <label className={styles.detailLabel}>City</label>
                  <p className={styles.detailValue}>{authUser.city}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button 
              onClick={() => navigate('/dashboard')}
              className={styles.actionBtn}
            >
              <Edit2 size={18} />
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
