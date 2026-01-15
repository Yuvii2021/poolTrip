import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Users, Star, Clock, Phone, MessageCircle,
  ChevronLeft, ChevronRight, Check, X, Shield, FileText, ArrowRight, Sparkles,
  Plane, Camera, Heart, Images
} from 'lucide-react';
import { packageAPI } from '../services/api';
import { TravelPackage } from '../types';
import styles from './PackageDetailPage.module.css';

const defaultImages: Record<string, string> = {
  ADVENTURE: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
  BEACH: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
  CULTURAL: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200',
  HONEYMOON: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
  FAMILY: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200',
  PILGRIMAGE: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200',
  WILDLIFE: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200',
  CRUISE: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200',
  LUXURY: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
  BUDGET: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',
};

const packageTypeIcons: Record<string, string> = {
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

// Helper function to check if a string is a valid image URL or base64
const isValidImage = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  return trimmed.startsWith('http://') || 
         trimmed.startsWith('https://') || 
         trimmed.startsWith('data:image/');
};

// Helper function to parse images (comma-separated string or array)
const parseImages = (coverImage: string | undefined, images: string | string[] | undefined, packageType: string): string[] => {
  const defaultImg = defaultImages[packageType] || defaultImages.ADVENTURE;
  const allImages: string[] = [];
  
  // Add cover image first if valid
  if (coverImage && isValidImage(coverImage)) {
    allImages.push(coverImage);
  }
  
  // Parse additional images
  if (images) {
    if (Array.isArray(images)) {
      allImages.push(...images.filter(img => isValidImage(img) && img !== coverImage));
    } else if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) {
          allImages.push(...parsed.filter((img: string) => isValidImage(img) && img !== coverImage));
        }
      } catch {
        // Comma-separated - but be careful not to split base64 strings
        if (!images.startsWith('data:image/')) {
          const imgList = images.split(',').map(img => img.trim()).filter(img => isValidImage(img) && img !== coverImage);
          allImages.push(...imgList);
        } else if (isValidImage(images) && images !== coverImage) {
          allImages.push(images);
        }
      }
    }
  }
  
  // If no images, use default
  if (allImages.length === 0) {
    allImages.push(defaultImg);
  }
  
  return allImages;
};

export const PackageDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<TravelPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'terms'>('overview');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadPackage(parseInt(id));
    }
  }, [id]);

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

  // Get all images for the package
  const allImages = pkg ? parseImages(pkg.coverImage, pkg.images, pkg.packageType) : [];
  const coverImage = pkg?.coverImage || defaultImages[pkg?.packageType || 'ADVENTURE'] || defaultImages.ADVENTURE;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleCall = () => {
    if (pkg?.agencyPhone) {
      window.location.href = `tel:${pkg.agencyPhone}`;
    }
  };

  const handleWhatsApp = () => {
    if (pkg?.agencyWhatsapp) {
      const message = `Hi! I'm interested in the "${pkg.title}" package.`;
      window.open(`https://wa.me/${pkg.agencyWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`);
    }
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
    <div className={styles.page}>
      {/* Hero Section with Cover Image */}
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          <img src={coverImage} alt={pkg.title} />
          <div className={styles.heroOverlay} />
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
                {packageTypeIcons[pkg.packageType]} {pkg.packageType}
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
              {pkg.rating && (
                <div className={styles.heroMetaItem}>
                  <Star size={18} fill="currentColor" />
                  <span>{pkg.rating.toFixed(1)} ({pkg.reviewCount} reviews)</span>
                </div>
              )}
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
                initial={{ opacity: 0, y: 20 }}
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

                {/* Photo Gallery */}
                {allImages.length > 0 && (
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                      <Images size={20} />
                      Photo Gallery
                    </h3>
                    <div className={styles.photoGallery}>
                      {allImages.map((img, index) => (
                        <motion.div
                          key={index}
                          className={styles.galleryImage}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => openLightbox(index)}
                        >
                          <img 
                            src={img} 
                            alt={`${pkg.title} - Photo ${index + 1}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                            }}
                          />
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
                initial={{ opacity: 0, y: 20 }}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.terms}
              >
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <Shield size={20} />
                    Cancellation Policy
                  </h3>
                  <p className={styles.policyText}>
                    {pkg.cancellationPolicy || 'Free cancellation up to 7 days before departure. 50% refund for cancellations 3-7 days before. No refund for cancellations less than 3 days before departure.'}
                  </p>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <FileText size={20} />
                    Terms & Conditions
                  </h3>
                  <p className={styles.policyText}>
                    {pkg.termsAndConditions || 'Valid government ID required at the time of booking. Prices are subject to change during peak seasons. The itinerary may be modified due to weather conditions or unforeseen circumstances.'}
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
                <span className={styles.originalPrice}>₹{pkg.price.toLocaleString()}</span>
              )}
              <div className={styles.currentPrice}>
                <span className={styles.priceValue}>
                  ₹{(hasDiscount ? pkg.discountedPrice! : pkg.price).toLocaleString()}
                </span>
                <span className={styles.priceLabel}>per person</span>
              </div>
            </div>

            <div className={styles.availability}>
              <div className={styles.availabilityItem}>
                <Users size={18} />
                <span>{pkg.availableSeats} seats available</span>
              </div>
              {pkg.startDate && (
                <div className={styles.availabilityItem}>
                  <Calendar size={18} />
                  <span>Starts {new Date(pkg.startDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className={styles.ctaButtons}>
              <motion.button
                className={styles.callBtn}
                onClick={handleCall}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Phone size={18} />
                Call Now
              </motion.button>
              <motion.button
                className={styles.whatsappBtn}
                onClick={handleWhatsApp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle size={18} />
                WhatsApp
              </motion.button>
            </div>
          </div>

          {/* Agency Card */}
          <div className={styles.agencyCard}>
            <div className={styles.agencyHeader}>
              <div className={styles.agencyAvatar}>
                <Plane size={24} />
              </div>
              <div>
                <h4 className={styles.agencyName}>{pkg.agencyName || 'Travel Agency'}</h4>
                <p className={styles.agencyLabel}>Verified Agency</p>
              </div>
            </div>
            <div className={styles.agencyStats}>
              <div className={styles.agencyStat}>
                <strong>100+</strong>
                <span>Packages</span>
              </div>
              <div className={styles.agencyStat}>
                <strong>4.8</strong>
                <span>Rating</span>
              </div>
              <div className={styles.agencyStat}>
                <strong>5K+</strong>
                <span>Travelers</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

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
              <img src={allImages[lightboxIndex]} alt={`${pkg.title} - Photo ${lightboxIndex + 1}`} />
              
              {allImages.length > 1 && (
                <>
                  <button className={`${styles.lightboxNav} ${styles.lightboxPrev}`} onClick={prevImage}>
                    <ChevronLeft size={32} />
                  </button>
                  <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={nextImage}>
                    <ChevronRight size={32} />
                  </button>
                  
                  <div className={styles.lightboxCounter}>
                    {lightboxIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </motion.div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className={styles.lightboxThumbs}>
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    className={`${styles.thumb} ${index === lightboxIndex ? styles.thumbActive : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(index);
                    }}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


