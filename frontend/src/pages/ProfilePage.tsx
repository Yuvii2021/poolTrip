import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Building,
  Star, MessageSquare, Edit2, CheckCircle2, ShieldCheck, Upload, X, Camera, Save
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
  bio?: string;
  profilePhoto?: string | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  rating: number;
  reviewCount: number;
}

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Draft fields (only active in edit mode)
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftBio, setDraftBio] = useState('');
  const [draftWhatsapp, setDraftWhatsapp] = useState('');

  const [photoUploading, setPhotoUploading] = useState(false);

  // Email OTP modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!showEmailModal) return;
    if (resendSeconds <= 0) return;
    const t = setInterval(() => setResendSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [showEmailModal, resendSeconds]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await authAPI.getCurrentUser();
      setProfile(data);
      populateDrafts(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const populateDrafts = (data: UserProfile) => {
    setDraftName(data.fullName || '');
    setDraftEmail(data.email || '');
    setDraftBio(data.bio || '');
    setDraftWhatsapp(data.whatsappNumber || '');
  };

  const verificationPercent = useMemo(() => {
    const steps = 4;
    let done = 0;
    const phoneVerified = !!(profile?.phoneVerified ?? true);
    const emailVerified = !!(profile?.emailVerified ?? false);
    const hasPhoto = !!(profile?.profilePhoto && String(profile.profilePhoto).trim().length > 0);
    const hasBio = !!(profile?.bio && String(profile.bio).trim().length > 0);
    if (phoneVerified) done++;
    if (emailVerified) done++;
    if (hasPhoto) done++;
    if (hasBio) done++;
    return Math.round((done * 100) / steps);
  }, [profile]);

  const enterEditMode = () => {
    if (profile) populateDrafts(profile);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (profile) populateDrafts(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updates: { fullName?: string; email?: string; whatsappNumber?: string; bio?: string } = {};

      if (draftName.trim() && draftName.trim() !== profile?.fullName) {
        updates.fullName = draftName.trim();
      }
      if (draftEmail.trim() && draftEmail.trim() !== profile?.email) {
        updates.email = draftEmail.trim();
      }
      if (draftWhatsapp.trim() !== (profile?.whatsappNumber || '')) {
        updates.whatsappNumber = draftWhatsapp.trim();
      }
      // Always send bio so it can be cleared
      if (draftBio.trim() !== (profile?.bio || '')) {
        updates.bio = draftBio.trim();
      }

      if (Object.keys(updates).length > 0) {
        await authAPI.updateCurrentUser(updates);
      }
      await fetchProfile();
      await refreshUser();
      setIsEditing(false);
    } catch (e: any) {
      console.error('Failed to save profile:', e);
      alert(e?.response?.data?.message || e?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPhoto = async (file: File) => {
    try {
      setPhotoUploading(true);
      await authAPI.uploadProfilePhoto(file);
      await fetchProfile();
      await refreshUser();
    } catch (e) {
      console.error('Failed to upload profile photo:', e);
    } finally {
      setPhotoUploading(false);
    }
  };

  const openEmailVerify = async () => {
    setShowEmailModal(true);
    setOtp('');
    try {
      setSendingOtp(true);
      const email = profile?.email || authUser?.email;
      if (email) {
        await authAPI.sendEmailOtp(email);
        setResendSeconds(59);
      }
    } catch (e) {
      console.error('Failed to send email OTP:', e);
    } finally {
      setSendingOtp(false);
    }
  };

  const resendEmailOtp = async () => {
    try {
      const email = profile?.email || authUser?.email;
      if (!email) return;
      setSendingOtp(true);
      await authAPI.sendEmailOtp(email);
      setResendSeconds(59);
    } catch (e) {
      console.error('Failed to resend OTP:', e);
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyEmailOtp = async () => {
    try {
      setVerifyingOtp(true);
      await authAPI.verifyEmailOtp(otp.trim());
      setShowEmailModal(false);
      await fetchProfile();
      await refreshUser();
    } catch (e) {
      console.error('Failed to verify email OTP:', e);
    } finally {
      setVerifyingOtp(false);
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 className={styles.title}>My Profile</h1>
              <p className={styles.subtitle}>Manage your account information and preferences</p>
            </div>
            {!isEditing ? (
              <button type="button" onClick={enterEditMode} className={styles.editToggleBtn}>
                <Edit2 size={16} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={cancelEdit} className={styles.cancelBtn} disabled={saving}>
                  Cancel
                </button>
                <button type="button" onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
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
            <label className={styles.avatar} style={{ cursor: photoUploading ? 'not-allowed' : 'pointer', position: 'relative', overflow: 'hidden' }}>
              {profile?.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.fullName}
                  style={{ width: '100%', height: '100%', borderRadius: '999px', objectFit: 'cover' }}
                />
              ) : (
                <User size={48} />
              )}
              <span className={styles.avatarOverlay}>
                {photoUploading ? <Upload size={20} className={styles.avatarOverlayIconSpin} /> : <Camera size={20} />}
              </span>
              <input
                type="file"
                accept="image/*"
                disabled={photoUploading}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadPhoto(f);
                  e.currentTarget.value = '';
                }}
              />
            </label>
            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>{profile?.fullName || authUser?.fullName}</h2>
              <p className={styles.profileEmail}>{profile?.email || authUser?.email}</p>

              {/* Bio display (read mode) */}
              {!isEditing && profile?.bio && (
                <p style={{ marginTop: 8, color: 'var(--color-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5, margin: '8px 0 0' }}>
                  {profile.bio}
                </p>
              )}

              {/* Verification progress */}
              <div style={{ marginTop: 12, maxWidth: 260 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                    {verificationPercent >= 100 ? 'Fully verified' : `Profile ${verificationPercent}% complete`}
                  </span>
                  {verificationPercent >= 100 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontWeight: 800, fontSize: 12 }}>
                      <CheckCircle2 size={13} />
                    </span>
                  )}
                </div>
                <div style={{ height: 5, borderRadius: 999, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 999, width: `${verificationPercent}%`,
                    background: verificationPercent >= 100 ? '#059669' : 'var(--gradient-primary)',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

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

          {/* Editable Bio (only in edit mode) */}
          {isEditing && (
            <div style={{ marginBottom: 22 }}>
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}><Edit2 size={20} /></div>
                <div className={styles.detailContent}>
                  <label className={styles.detailLabel}>Bio</label>
                  <textarea
                    value={draftBio}
                    onChange={(e) => setDraftBio(e.target.value)}
                    placeholder="Tell people about yourself..."
                    rows={3}
                    className={styles.editInput}
                    style={{ resize: 'vertical', minHeight: 72 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Profile Details */}
          <div className={styles.details}>
            {/* Full Name */}
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><User size={20} /></div>
              <div className={styles.detailContent}>
                <label className={styles.detailLabel}>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className={styles.editInput}
                    placeholder="Your full name"
                  />
                ) : (
                  <p className={styles.detailValue}>{profile?.fullName || authUser?.fullName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><Mail size={20} /></div>
              <div className={styles.detailContent}>
                <label className={styles.detailLabel}>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={draftEmail}
                    onChange={(e) => setDraftEmail(e.target.value)}
                    className={styles.editInput}
                    placeholder="your@email.com"
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <p className={styles.detailValue} style={{ margin: 0 }}>{profile?.email || authUser?.email}</p>
                    {profile?.emailVerified ? (
                      <span className={styles.verifiedBadge}>
                        <CheckCircle2 size={13} /> Verified
                      </span>
                    ) : (
                      <button type="button" onClick={openEmailVerify} className={styles.verifyNowBtn}>
                        Verify now
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><Phone size={20} /></div>
              <div className={styles.detailContent}>
                <label className={styles.detailLabel}>Phone Number</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <p className={styles.detailValue} style={{ margin: 0 }}>{profile?.phone || authUser?.phone}</p>
                  <span className={styles.verifiedBadge}>
                    <ShieldCheck size={13} /> Verified
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><MessageSquare size={20} /></div>
              <div className={styles.detailContent}>
                <label className={styles.detailLabel}>WhatsApp Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={draftWhatsapp}
                    onChange={(e) => setDraftWhatsapp(e.target.value)}
                    className={styles.editInput}
                    placeholder="10-digit WhatsApp number"
                  />
                ) : (
                  <p className={styles.detailValue}>{profile?.whatsappNumber || 'Not set'}</p>
                )}
              </div>
            </div>

            {authUser?.role === 'AGENCY' && authUser?.agencyName && (
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}><Building size={20} /></div>
                <div className={styles.detailContent}>
                  <label className={styles.detailLabel}>Agency Name</label>
                  <p className={styles.detailValue}>{authUser.agencyName}</p>
                </div>
              </div>
            )}

            {authUser?.city && (
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}><MapPin size={20} /></div>
                <div className={styles.detailContent}>
                  <label className={styles.detailLabel}>City</label>
                  <p className={styles.detailValue}>{authUser.city}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom actions (only in edit mode) */}
          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <button type="button" onClick={cancelEdit} className={styles.cancelBtn} disabled={saving}>
                Cancel
              </button>
              <button type="button" onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Action Buttons (view mode) */}
          {!isEditing && (
            <div className={styles.actions}>
              <button onClick={() => navigate('/dashboard')} className={styles.actionBtn}>
                <Edit2 size={18} />
                Go to Dashboard
              </button>
            </div>
          )}
        </motion.div>

        {/* Email OTP modal */}
        {showEmailModal && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
              display: 'grid', placeItems: 'center', zIndex: 2000, padding: 16
            }}
            onClick={() => setShowEmailModal(false)}
          >
            <div
              style={{
                width: 'min(520px, 100%)', background: 'white', borderRadius: 16,
                boxShadow: '0 24px 80px rgba(0,0,0,0.25)', overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <div style={{ fontWeight: 900, fontFamily: 'var(--font-display)' }}>Verify email</div>
                <button type="button" onClick={() => setShowEmailModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: 16, display: 'grid', gap: 12 }}>
                <div style={{ color: 'rgba(0,0,0,0.7)', fontWeight: 600 }}>
                  We sent an OTP to <strong>{profile?.email || authUser?.email}</strong>
                </div>

                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  inputMode="numeric"
                  style={{
                    width: '100%', padding: '12px 12px', borderRadius: 12,
                    border: '1px solid rgba(0,0,0,0.14)', fontSize: 16,
                    fontWeight: 700, letterSpacing: 2
                  }}
                />

                <button
                  type="button"
                  onClick={verifyEmailOtp}
                  disabled={verifyingOtp || otp.trim().length < 4}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: 'none', background: 'var(--gradient-primary)',
                    color: '#fff', fontWeight: 900,
                    cursor: verifyingOtp ? 'not-allowed' : 'pointer',
                    opacity: verifyingOtp ? 0.7 : 1
                  }}
                >
                  {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={resendEmailOtp}
                    disabled={sendingOtp || resendSeconds > 0}
                    style={{
                      border: 'none', background: 'transparent',
                      color: resendSeconds > 0 ? 'rgba(0,0,0,0.4)' : 'var(--color-primary)',
                      fontWeight: 800,
                      cursor: (sendingOtp || resendSeconds > 0) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {sendingOtp ? 'Sending...' : 'Resend OTP'}
                  </button>
                  {resendSeconds > 0 && (
                    <div style={{ color: 'rgba(0,0,0,0.55)', fontWeight: 700 }}>
                      Resend in {resendSeconds}s
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
