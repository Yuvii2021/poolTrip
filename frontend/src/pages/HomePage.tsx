import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, ArrowRight, Users, Wallet, Shield,
  Car, Bus, Mountain, Palmtree, Heart, Compass, Sparkles,
  TrendingUp, CheckCircle2, ChevronRight, Calendar, X, ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { packageAPI } from '../services/api';
import { TravelPackage, PackageType } from '../types';
import styles from './HomePage.module.css';

const categories: { type: PackageType | 'ALL'; label: string; emoji: string }[] = [
  { type: 'ALL', label: 'All Trips', emoji: '🌍' },
  { type: 'ADVENTURE', label: 'Adventure', emoji: '🏔️' },
  { type: 'BEACH', label: 'Beach', emoji: '🏖️' },
  { type: 'CULTURAL', label: 'Cultural', emoji: '🏛️' },
  { type: 'HONEYMOON', label: 'Honeymoon', emoji: '💑' },
  { type: 'FAMILY', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { type: 'WILDLIFE', label: 'Wildlife', emoji: '🦁' },
  { type: 'LUXURY', label: 'Luxury', emoji: '💎' },
];

const howItWorks = [
  { icon: <Search size={24} />, title: 'Find Your Trip', description: 'Browse rides and packages going your way', color: '#6366f1' },
  { icon: <Users size={24} />, title: 'Join the Pool', description: 'Book your seat with fellow travelers', color: '#ec4899' },
  { icon: <Wallet size={24} />, title: 'Save Money', description: 'Split costs, travel for less', color: '#14b8a6' }
];

// Trip Card Component - Unique Design
const TripCard = ({ pkg, index, variant = 'default' }: { pkg: TravelPackage; index: number; variant?: 'default' | 'featured' | 'compact' }) => {
  const filledSeats = pkg.totalSeats - pkg.availableSeats;
  const fillPercent = (filledSeats / pkg.totalSeats) * 100;
  const hasDiscount = pkg.discountedPrice && pkg.discountedPrice < pkg.price;

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

  const imageUrl = pkg.coverImage || defaultImages[pkg.packageType] || defaultImages.ADVENTURE;

  if (variant === 'featured') {
    return (
      <motion.div
        className={styles.featuredCard}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
      >
        <Link to={`/package/${pkg.id}`} className={styles.featuredCardLink}>
          <div className={styles.featuredCardImage}>
            <img src={imageUrl} alt={pkg.title} />
            <div className={styles.featuredCardOverlay} />
            {fillPercent >= 70 && (
              <span className={styles.urgentBadge}>🔥 Almost Full</span>
            )}
          </div>
          <div className={styles.featuredCardContent}>
            <div className={styles.featuredCardRoute}>
              {pkg.origin && <span>{pkg.origin}</span>}
              {pkg.origin && <ArrowRight size={14} />}
              <span className={styles.destination}>{pkg.destination}</span>
            </div>
            <h3>{pkg.title}</h3>
            <div className={styles.featuredCardMeta}>
              <span><Calendar size={14} /> {pkg.durationDays}D</span>
              <span><Users size={14} /> {pkg.availableSeats} left</span>
            </div>
            <div className={styles.featuredCardFooter}>
              <div className={styles.featuredCardPrice}>
                {hasDiscount && <span className={styles.oldPrice}>₹{pkg.price.toLocaleString()}</span>}
                <span className={styles.currentPrice}>₹{(hasDiscount ? pkg.discountedPrice! : pkg.price).toLocaleString()}</span>
                <span className={styles.perPerson}>/person</span>
              </div>
              <div className={styles.seatIndicator}>
                <div className={styles.seatBar}>
                  <div className={styles.seatProgress} style={{ width: `${fillPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.tripCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
    >
      <Link to={`/package/${pkg.id}`} className={styles.tripCardLink}>
        <div className={styles.tripCardImage}>
          <img src={imageUrl} alt={pkg.title} />
          <div className={styles.tripCardBadges}>
            {pkg.featured && <span className={styles.featuredBadge}><Sparkles size={12} /> Featured</span>}
            {hasDiscount && <span className={styles.discountBadge}>{Math.round(((pkg.price - pkg.discountedPrice!) / pkg.price) * 100)}% OFF</span>}
          </div>
          <div className={styles.tripCardType}>{pkg.packageType}</div>
        </div>
        
        <div className={styles.tripCardBody}>
          <div className={styles.tripCardHeader}>
            <div className={styles.tripCardRoute}>
              {pkg.origin ? (
                <>
                  <span className={styles.routeOrigin}>{pkg.origin}</span>
                  <ArrowRight size={12} />
                  <span className={styles.routeDest}>{pkg.destination}</span>
                </>
              ) : (
                <span className={styles.routeDest}><MapPin size={12} /> {pkg.destination}</span>
              )}
            </div>
          </div>
          
          <h3 className={styles.tripCardTitle}>{pkg.title}</h3>
          
          <div className={styles.tripCardInfo}>
            <div className={styles.tripCardDuration}>
              <Calendar size={14} />
              <span>{pkg.durationDays}D / {pkg.durationNights || pkg.durationDays - 1}N</span>
            </div>
            <div className={styles.tripCardSeats}>
              <Users size={14} />
              <span>{filledSeats}/{pkg.totalSeats} joined</span>
            </div>
          </div>

          <div className={styles.tripCardSeatsVisual}>
            <div className={styles.tripSeatBar}>
              <motion.div 
                className={styles.tripSeatFill}
                initial={{ width: 0 }}
                animate={{ width: `${fillPercent}%` }}
                transition={{ duration: 0.8, delay: index * 0.05 }}
              />
            </div>
            {fillPercent >= 70 && <span className={styles.fillingFast}>Filling Fast!</span>}
          </div>

          <div className={styles.tripCardFooter}>
            <div className={styles.tripCardPricing}>
              {hasDiscount && <span className={styles.tripOldPrice}>₹{pkg.price.toLocaleString()}</span>}
              <span className={styles.tripPrice}>₹{(hasDiscount ? pkg.discountedPrice! : pkg.price).toLocaleString()}</span>
              <span className={styles.tripPer}>/person</span>
            </div>
            <button className={styles.joinButton}>
              Join <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export const HomePage = () => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [featuredPackages, setFeaturedPackages] = useState<TravelPackage[]>([]);
  const [searchResults, setSearchResults] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PackageType | 'ALL'>('ALL');
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const featuredScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const [allPackages, featured] = await Promise.all([
        packageAPI.getAllPackages(),
        packageAPI.getFeaturedPackages(),
      ]);
      setPackages(allPackages);
      setFeaturedPackages(featured);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const query = searchTo.trim() || searchFrom.trim();
    if (!query) {
      clearSearch();
      return;
    }
    setLoading(true);
    setIsSearching(true);
    setSearchQuery(query);
    try {
      const results = await packageAPI.searchPackages(query);
      setSearchResults(results);
      // Scroll to results
      setTimeout(() => {
        searchResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
    setSearchQuery('');
    setSearchFrom('');
    setSearchTo('');
  };

  const handleCategoryChange = async (category: PackageType | 'ALL') => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      if (category === 'ALL') {
        const allPackages = await packageAPI.getAllPackages();
        setPackages(allPackages);
      } else {
        const filtered = await packageAPI.getPackagesByType(category);
        setPackages(filtered);
      }
    } catch (error) {
      console.error('Error filtering:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollFeatured = (direction: 'left' | 'right') => {
    if (featuredScrollRef.current) {
      const scrollAmount = 400;
      featuredScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const filledSeats = packages.reduce((acc, pkg) => acc + (pkg.totalSeats - pkg.availableSeats), 0);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.gradientOrb1} />
          <div className={styles.gradientOrb2} />
          <div className={styles.gridPattern} />
        </div>

        <div className={styles.heroContainer}>
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div className={styles.heroBadge} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Users size={14} />
              <span>Community-Powered Travel</span>
              <Sparkles size={14} />
            </motion.div>

            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleLine}>Travel Together,</span>
              <span className={styles.heroTitleGradient}>Pay Less</span>
            </h1>

            <p className={styles.heroSubtitle}>
              Join ride pools and group trips posted by travelers like you. 
              Share the journey, split the costs, make new friends.
            </p>

            {/* Search Box - Fixed */}
            <motion.div className={styles.searchBox} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className={styles.searchFields}>
                <div className={styles.searchField}>
                  <div className={styles.originDot} />
                  <input
                    type="text"
                    placeholder="From where?"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className={styles.searchDivider}><ArrowRight size={16} /></div>
                <div className={styles.searchField}>
                  <MapPin size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Where to?"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <motion.button className={styles.searchBtn} onClick={handleSearch} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Search size={18} />
                <span>Find Trips</span>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div className={styles.heroStats} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>{packages.length}+</span>
                <span className={styles.heroStatLabel}>Active Trips</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>{filledSeats}+</span>
                <span className={styles.heroStatLabel}>Travelers</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>40%</span>
                <span className={styles.heroStatLabel}>Avg. Savings</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div className={styles.heroVisual} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
            <div className={styles.journeyCard}>
              <div className={styles.journeyCardHeader}>
                <span className={styles.journeyLive}><span className={styles.liveDot} /> Live Pool</span>
                <span className={styles.journeyDate}><Calendar size={14} /> Tomorrow</span>
              </div>
              <div className={styles.journeyRoute}>
                <div className={styles.journeyPoint}><div className={styles.journeyDot} /><span>Delhi</span></div>
                <div className={styles.journeyLine}><Bus size={16} /></div>
                <div className={styles.journeyPoint}><MapPin size={16} /><span>Manali</span></div>
              </div>
              <div className={styles.journeySeats}>
                <span className={styles.journeySeatsLabel}>Seats</span>
                <div className={styles.seatDots}>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className={`${styles.seatDot} ${i < 8 ? styles.seatFilled : ''}`} />
                  ))}
                </div>
                <span className={styles.journeySeatsCount}>8/12 filled</span>
              </div>
              <div className={styles.journeyFooter}>
                <div className={styles.journeyPrice}>
                  <span className={styles.journeyPriceValue}>₹899</span>
                  <span className={styles.journeyPricePer}>/person</span>
                </div>
                <div className={styles.journeySavings}><TrendingUp size={14} /> Save ₹400</div>
              </div>
            </div>
            <motion.div className={styles.floatingBadge1} animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <CheckCircle2 size={16} /><span>Verified Host</span>
            </motion.div>
            <motion.div className={styles.floatingBadge2} animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              <Shield size={16} /><span>Secure Booking</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Search Results - Shows at top when searching */}
      <AnimatePresence>
        {isSearching && (
          <motion.section
            ref={searchResultsRef}
            className={styles.searchResultsSection}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.sectionContainer}>
              <div className={styles.searchResultsHeader}>
                <div>
                  <h2 className={styles.searchResultsTitle}>
                    Search Results for "{searchQuery}"
                  </h2>
                  <p className={styles.searchResultsCount}>{searchResults.length} trips found</p>
                </div>
                <button className={styles.clearSearchBtn} onClick={clearSearch}>
                  <X size={18} /> Clear Search
                </button>
              </div>
              
              {loading ? (
                <div className={styles.loadingGrid}>
                  {[...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} />)}
                </div>
              ) : searchResults.length > 0 ? (
                <div className={styles.searchResultsGrid}>
                  {searchResults.map((pkg, index) => (
                    <TripCard key={pkg.id} pkg={pkg} index={index} />
                  ))}
                </div>
              ) : (
                <div className={styles.noResults}>
                  <Compass size={48} />
                  <h3>No trips found for "{searchQuery}"</h3>
                  <p>Try a different destination or check back later</p>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Simple Process</span>
            <h2 className={styles.sectionTitle}>How Pooling Works</h2>
          </div>
          <div className={styles.stepsGrid}>
            {howItWorks.map((step, index) => (
              <motion.div key={index} className={styles.stepCard} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <div className={styles.stepIcon} style={{ background: `${step.color}15`, color: step.color }}>{step.icon}</div>
                <div className={styles.stepNumber}>{index + 1}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pool Types */}
      <section className={styles.poolTypes}>
        <div className={styles.sectionContainer}>
          <div className={styles.poolTypeCards}>
            <motion.div className={`${styles.poolTypeCard} ${styles.poolTypeRide}`} whileHover={{ scale: 1.02, y: -5 }}>
              <div className={styles.poolTypeIcon}><Car size={28} /></div>
              <div className={styles.poolTypeContent}><h3>Pool a Ride</h3><p>Share cars & buses for intercity travel</p></div>
              <ChevronRight size={20} className={styles.poolTypeArrow} />
            </motion.div>
            <motion.div className={`${styles.poolTypeCard} ${styles.poolTypeTrip}`} whileHover={{ scale: 1.02, y: -5 }}>
              <div className={styles.poolTypeIcon}><Compass size={28} /></div>
              <div className={styles.poolTypeContent}><h3>Join a Trip</h3><p>Group travel packages with shared costs</p></div>
              <ChevronRight size={20} className={styles.poolTypeArrow} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Trips - Horizontal Scroll */}
      {featuredPackages.length > 0 && !isSearching && (
        <section className={styles.featuredSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.featuredHeader}>
              <div>
                <span className={styles.sectionBadge}><Sparkles size={14} /> Trending</span>
                <h2 className={styles.sectionTitle}>Featured Trips</h2>
              </div>
              <div className={styles.scrollControls}>
                <button onClick={() => scrollFeatured('left')} className={styles.scrollBtn}><ChevronLeft size={20} /></button>
                <button onClick={() => scrollFeatured('right')} className={styles.scrollBtn}><ChevronRight size={20} /></button>
              </div>
            </div>
            <div className={styles.featuredScroll} ref={featuredScrollRef}>
              {featuredPackages.map((pkg, index) => (
                <TripCard key={pkg.id} pkg={pkg} index={index} variant="featured" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {!isSearching && (
        <section className={styles.section}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Browse</span>
              <h2 className={styles.sectionTitle}>Explore by Category</h2>
            </div>
            <div className={styles.categories}>
              {categories.map((cat) => (
                <motion.button
                  key={cat.type}
                  className={`${styles.categoryBtn} ${selectedCategory === cat.type ? styles.categoryActive : ''}`}
                  onClick={() => handleCategoryChange(cat.type)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className={styles.categoryEmoji}>{cat.emoji}</span>
                  <span className={styles.categoryLabel}>{cat.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Packages */}
      {!isSearching && (
        <section className={styles.section}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeaderInline}>
              <h2 className={styles.sectionTitleSmall}>
                {selectedCategory === 'ALL' ? 'All Available Trips' : `${selectedCategory} Trips`}
              </h2>
              <span className={styles.packageCount}>{packages.length} trips</span>
            </div>

            {loading ? (
              <div className={styles.loadingGrid}>
                {[...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)}
              </div>
            ) : packages.length > 0 ? (
              <div className={styles.tripsGrid}>
                {packages.map((pkg, index) => (
                  <TripCard key={pkg.id} pkg={pkg} index={index} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Compass size={48} />
                <h3>No trips found</h3>
                <p>Try adjusting your filters or check back later</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <motion.div className={styles.ctaContent} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className={styles.ctaTitle}>Have a vehicle? <span>Start hosting trips</span></h2>
            <p className={styles.ctaSubtitle}>Turn your empty seats into earnings. Post your trip and let travelers join.</p>
            <motion.button className={styles.ctaBtn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <span>Become a Host</span>
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
