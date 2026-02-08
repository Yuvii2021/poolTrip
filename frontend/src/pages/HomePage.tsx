import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, ArrowRight, Users, Calendar, Star,
  Compass, Shield, Award, ChevronRight, ChevronLeft, 
  ChevronDown, Sparkles, X, SlidersHorizontal
} from 'lucide-react';
import { packageAPI } from '../services/api';
import { TravelPackage, PackageWithDistanceResponse, PackageFilters, PackageTypeOption } from '../types';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { FilterSidebar } from '../components/FilterSidebar';
import styles from './HomePage.module.css';

// ========== DATA ==========

const destinations = [
  { name: 'Kashmir', slug: 'kashmir', image: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=400' },
  { name: 'Goa', slug: 'goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400' },
  { name: 'Kerala', slug: 'kerala', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400' },
  { name: 'Rajasthan', slug: 'rajasthan', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400' },
  { name: 'Ladakh', slug: 'ladakh', image: 'https://images.unsplash.com/photo-1626015365107-36a02251e8f2?w=400' },
  { name: 'Andaman', slug: 'andaman', image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=400' },
  { name: 'Sikkim', slug: 'sikkim', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400' },
  { name: 'Varanasi', slug: 'varanasi', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400' },
];

const whyChooseUs = [
  { icon: <Compass size={28} />, title: 'Exclusive Trips', description: 'Handpicked trips to explore hidden gems across India.', color: '#c45c26' },
  { icon: <Shield size={28} />, title: 'Safety First', description: 'We prioritize your safety on every adventure.', color: '#2d5a45' },
  { icon: <Award size={28} />, title: 'Expert Guides', description: 'Professional guides to enhance your travel experience.', color: '#d4a574' },
  { icon: <Users size={28} />, title: 'Community Travel', description: 'Join fellow travelers and make new friends.', color: '#1a9988' },
];


// ========== TRIP CARD COMPONENT ==========
const TripCard = ({ pkg, index, distance, originInItinerary }: { 
  pkg: TravelPackage; 
  index: number;
  distance?: number | null;
  originInItinerary?: boolean;
}) => {
  const hasDiscount = pkg.discountedPrice && pkg.discountedPrice < pkg.price;
  const imageUrl = pkg.coverImage || undefined;

  return (
    <motion.div
      className={styles.tripCard}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/package/${pkg.id}`} className={styles.tripCardLink}>
        <div className={styles.tripCardImage}>
          {imageUrl ? (
            <img src={imageUrl} alt={pkg.title} />
          ) : (
            <div className={styles.tripCardImagePlaceholder}>
              <Compass size={40} />
            </div>
          )}
          <div className={styles.tripCardOverlay} />
          
          {/* Duration Badge */}
          <div className={styles.durationBadge}>
            {pkg.durationDays}D{pkg.durationNights ? `/${pkg.durationNights}N` : ''}
          </div>
          
          {/* Badges */}
          <div className={styles.tripCardBadges}>
            {originInItinerary && (
              <span className={styles.routeBadge}>📍 On Your Route</span>
            )}
            {hasDiscount && (
              <span className={styles.discountBadge}>
                {Math.round(((pkg.price - pkg.discountedPrice!) / pkg.price) * 100)}% OFF
              </span>
            )}
        </div>
        
          {/* Distance Badge */}
          {distance !== undefined && distance !== null && (
            <div className={styles.distanceBadge}>
              <MapPin size={12} /> {distance < 1 ? 'Same city' : `${Math.round(distance)} km`}
            </div>
          )}
          </div>
          
        <div className={styles.tripCardContent}>
          <h3 className={styles.tripCardTitle}>{pkg.title}</h3>
          
          <div className={styles.tripCardMeta}>
            {pkg.origin && (
              <span className={styles.tripCardRoute}>
                <MapPin size={14} />
                {pkg.origin} → {pkg.destination}
              </span>
            )}
            {(pkg.transportationIcon || pkg.transportation) && (
              <span className={styles.tripCardTransport}>
                {pkg.transportationIcon || '🚗'}
              </span>
            )}
            {pkg.rating && (
              <span className={styles.tripCardRating}>
                <Star size={14} fill="currentColor" /> {pkg.rating}
              </span>
            )}
          </div>

          <div className={styles.tripCardFooter}>
            <div className={styles.tripCardPrice}>
              <span className={styles.priceLabel}>Starts From</span>
              <span className={styles.priceValue}>₹{(hasDiscount ? pkg.discountedPrice! : pkg.price).toLocaleString()}</span>
            </div>
            <span className={styles.tripCardArrow}>
              <ArrowRight size={18} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ========== MAIN HOMEPAGE COMPONENT ==========
export const HomePage = () => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [featuredPackages, setFeaturedPackages] = useState<TravelPackage[]>([]);
  const [searchResults, setSearchResults] = useState<PackageWithDistanceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [filterTransport, setFilterTransport] = useState('');
  const [filterBudget, setFilterBudget] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [filters, setFilters] = useState<PackageFilters>({});
  const [isSearching, setIsSearching] = useState(false);
  const [isNearbySearch, setIsNearbySearch] = useState(false);
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [packageTypes, setPackageTypes] = useState<PackageTypeOption[]>([]);
  
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const featuredScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPackages();
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
    const origin = searchFrom.trim();
    const destination = searchTo.trim();
    // Check if there are any active filters (excluding undefined values)
    const hasFilters = filterTransport || filterBudget || !!(
      (filters.minPrice !== undefined) ||
      (filters.maxPrice !== undefined) ||
      (filters.days !== undefined) ||
      (filters.transportation !== undefined) ||
      (filters.featured !== undefined)
    );
    
    if (!origin && !destination && !searchDate && !hasFilters) {
      clearSearch();
      return;
    }
    
    setLoading(true);
    setIsSearching(true);
    
    try {
      let results: PackageWithDistanceResponse[] = [];
      
      // If we have origin coordinates and filters, try to use backend filtering
      // For now, we'll use the existing search APIs and apply filters client-side
      // TODO: Enhance backend APIs to accept filters in search endpoints
      
      if (origin && destination) {
        setIsNearbySearch(true);
        results = await packageAPI.searchPackagesNearby(origin, destination);
      } else if (origin && !destination) {
        setIsNearbySearch(true);
        results = await packageAPI.searchPackagesFromOrigin(origin);
      } else {
        setIsNearbySearch(false);
        const pkgs = await packageAPI.searchPackages(destination || '');
        results = pkgs.map(pkg => ({
          packageInfo: pkg,
          distanceFromUserOrigin: null,
          originInItinerary: false
        }));
      }
      
      // Apply filters (client-side for now)
      results = applyFiltersToResults(results);
      
      // Filter by date if provided
      if (searchDate) {
        results = results.filter(result => {
          const pkg = result.packageInfo;
          if (!pkg.startDate) return false;
          const pkgDate = new Date(pkg.startDate);
          const filterDate = new Date(searchDate);
          return pkgDate >= filterDate;
        });
      }
      
      // Legacy filter support (for backward compatibility)
      if (filterTransport) {
        results = results.filter(result => 
          result.packageInfo.vehicleType === filterTransport
        );
      }
      
      if (filterBudget) {
        const budgetOption = budgetOptions.find(b => b.value === filterBudget);
        if (budgetOption) {
          results = results.filter(result => {
            const price = result.packageInfo.discountedPrice || result.packageInfo.price;
            return price >= budgetOption.min && price <= budgetOption.max;
          });
        }
      }
      
      setSearchResults(results);
      setTimeout(() => {
        searchResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersToResults = (results: PackageWithDistanceResponse[]): PackageWithDistanceResponse[] => {
    let filtered = [...results];
    
    // Price filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filtered = filtered.filter(result => {
        const price = result.packageInfo.discountedPrice || result.packageInfo.price;
        const min = filters.minPrice ?? 0;
        const max = filters.maxPrice ?? Infinity;
        return price >= min && price <= max;
      });
    }
    
    // Duration filter
    if (filters.days !== undefined) {
      filtered = filtered.filter(result => 
        result.packageInfo.durationDays === filters.days
      );
    }
    
    // Transportation filter
    if (filters.transportation) {
      filtered = filtered.filter(result => 
        result.packageInfo.vehicleType === filters.transportation
      );
    }
    
    // Featured filter
    if (filters.featured) {
      filtered = filtered.filter(result => result.packageInfo.featured === true);
    }
    
    return filtered;
  };

  const handleApplyFilters = () => {
    setShowFilterSidebar(false);
    // If we're already searching, re-run the search with new filters
    if (isSearching) {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
    setSearchFrom('');
    setSearchTo('');
    setSearchDate('');
    setFilterTransport('');
    setFilterBudget('');
    setFilters({});
    setShowFilters(false);
    setShowFilterSidebar(false);
    setIsNearbySearch(false);
    setOriginCoords(null);
  };
  

  const scrollFeatured = (direction: 'left' | 'right') => {
    if (featuredScrollRef.current) {
      const scrollAmount = 340;
      featuredScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={styles.page}>
      {/* ========== HERO SECTION ========== */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img 
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920" 
            alt="Travel background"
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={styles.heroTitle}>
              Travel Is The Only Thing You Buy<br />
              <span className={styles.heroTitleAccent}>That Makes You Richer</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Discover amazing destinations, join group trips, and create unforgettable memories 
              with fellow travelers.
            </p>

            {/* Search Box */}
            <div className={styles.searchBox}>
              <div className={styles.searchField}>
                <MapPin size={18} className={styles.searchIcon} />
                <LocationAutocomplete
                  value={searchFrom}
                  onChange={(value) => setSearchFrom(value)}
                  placeholder="Your city"
                  showIcon={false}
                  inputClassName={styles.searchInput}
                />
              </div>
              
              <div className={styles.searchDivider} />
              
              <div className={styles.searchField}>
                <Compass size={18} className={styles.searchIcon} />
                <LocationAutocomplete
                  value={searchTo}
                  onChange={(value) => setSearchTo(value)}
                  placeholder="Destination"
                  showIcon={false}
                  inputClassName={styles.searchInput}
                />
              </div>
              
              <div className={styles.searchDivider} />
              
              <div className={styles.dateField} onClick={() => (document.getElementById('homeDatePicker') as HTMLInputElement)?.showPicker()}>
                <Calendar size={18} className={styles.dateIcon} />
                <input
                  id="homeDatePicker"
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className={`${styles.dateInput} ${!searchDate ? styles.dateEmpty : ''}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {!searchDate && <span className={styles.datePlaceholder}>Departure</span>}
              </div>
              
              <button 
                className={`${styles.filterBtn} ${showFilterSidebar ? styles.filterBtnActive : ''} ${Object.keys(filters).length > 0 ? styles.hasFilters : ''}`}
                onClick={() => setShowFilterSidebar(!showFilterSidebar)}
              >
                <SlidersHorizontal size={18} />
                {Object.keys(filters).length > 0 && <span className={styles.filterCount}>{Object.keys(filters).length}</span>}
              </button>
              
              <button className={styles.searchBtn} onClick={handleSearch}>
                <Search size={20} />
              </button>
            </div>
            
            {/* Filter Sidebar */}
            <FilterSidebar
              isOpen={showFilterSidebar}
              onClose={() => setShowFilterSidebar(false)}
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={handleApplyFilters}
            />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className={styles.scrollIndicator}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ========== SEARCH RESULTS ========== */}
      <AnimatePresence>
        {isSearching && (
          <motion.section
            ref={searchResultsRef}
            className={styles.searchResultsSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.container}>
              <div className={styles.searchResultsHeader}>
                <div>
                  <h2>
                    {isNearbySearch 
                      ? (searchTo ? `Trips to ${searchTo}` : `Trips near ${searchFrom}`)
                      : `Search Results`
                    }
                  </h2>
                  <p>{searchResults.length} trips found {isNearbySearch && '• Sorted by distance'}</p>
                </div>
                <button className={styles.clearSearchBtn} onClick={clearSearch}>
                  <X size={18} /> Clear
                </button>
              </div>
              
              {loading ? (
                <div className={styles.loadingGrid}>
                  {[...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} />)}
                </div>
              ) : searchResults.length > 0 ? (
                <div className={styles.tripsGrid}>
                  {searchResults.map((result, index) => (
                    <TripCard 
                      key={result.packageInfo.id} 
                      pkg={result.packageInfo} 
                      index={index}
                      distance={result.distanceFromUserOrigin}
                      originInItinerary={result.originInItinerary}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.noResults}>
                  <Compass size={48} />
                  <h3>No trips found</h3>
                  <p>Try a different destination or check back later</p>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ========== TOUR CATEGORIES ========== */}
      {!isSearching && (
        <section className={styles.categoriesSection}>
          <div className={styles.container}>
          <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>
                <Sparkles size={14} /> Explore
              </span>
              <h2 className={styles.sectionTitle}>Tour Categories</h2>
              <p className={styles.sectionSubtitle}>
                Choose your perfect travel style from our curated categories
              </p>
            </div>

            <div className={styles.categoriesGrid}>
              {packageTypes.map((cat, index) => (
                <motion.div
                  key={cat.value}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/categories/${cat.value}`} className={styles.categoryCard}>
                    <div className={styles.categoryImage}>
                      <div className={styles.categoryImagePlaceholder} />
                      <div className={styles.categoryOverlay} />
                    </div>
                    <div className={styles.categoryContent}>
                      <span className={styles.categoryEmoji}>{cat.icon}</span>
                      <h3>{cat.label}</h3>
          </div>
                  </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ========== UPCOMING EVENTS ========== */}
      {!isSearching && featuredPackages.length > 0 && (
        <section className={styles.upcomingSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeaderFlex}>
              <div>
                <span className={styles.sectionBadge}>
                  <Calendar size={14} /> Trending
                </span>
                <h2 className={styles.sectionTitle}>Upcoming Events</h2>
              </div>
              <div className={styles.scrollControls}>
                <button onClick={() => scrollFeatured('left')} className={styles.scrollBtn}>
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => scrollFeatured('right')} className={styles.scrollBtn}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className={styles.upcomingScroll} ref={featuredScrollRef}>
              {featuredPackages.map((pkg, index) => (
                <TripCard key={pkg.id} pkg={pkg} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== WHY CHOOSE US ========== */}
      {!isSearching && (
        <section className={styles.whyChooseSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Why PoolTrip</span>
              <h2 className={styles.sectionTitle}>Your Travel, Our Passion</h2>
              <p className={styles.sectionSubtitle}>
                We provide unique trips that showcase the beauty of India with a focus on safety and expert guidance.
              </p>
            </div>

            <div className={styles.whyChooseGrid}>
              {whyChooseUs.map((item, index) => (
                <motion.div
                  key={item.title}
                  className={styles.whyChooseCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.whyChooseIcon} style={{ color: item.color, background: `${item.color}15` }}>
                    {item.icon}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}



      {/* ========== ALL TRIPS ========== */}
      {!isSearching && packages.length > 0 && (
        <section className={styles.allTripsSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeaderFlex}>
              <div>
                <span className={styles.sectionBadge}>Browse All</span>
                <h2 className={styles.sectionTitle}>Popular Trips & Packages</h2>
              </div>
              <Link to="/categories" className={styles.viewAllLink}>
                View All <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className={styles.loadingGrid}>
                {[...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)}
              </div>
            ) : (
              <div className={styles.tripsGrid}>
                {packages.slice(0, 8).map((pkg, index) => (
                  <TripCard key={pkg.id} pkg={pkg} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
};
