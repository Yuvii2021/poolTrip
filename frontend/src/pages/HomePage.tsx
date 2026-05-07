import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, ArrowRight, Users, Calendar, Star,
  Compass, Shield, Award, ChevronRight, ChevronLeft, 
  ChevronDown, Sparkles, X, SlidersHorizontal, CheckCircle2
} from 'lucide-react';
import { packageAPI } from '../services/api';
import { TravelPackage, PackageWithDistanceResponse, PackageFilters, PackageTypeOption } from '../types';
import { LocationAutocomplete, LocationResult } from '../components/LocationAutocomplete';
import { FilterSidebar } from '../components/FilterSidebar';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import styles from './HomePage.module.css';

// ========== DATA ==========

// High-quality images for each category type
const categoryImages: Record<string, string> = {
  MOUNTAIN: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
  MOUNTAINS: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
  BEACH: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  CITY_TOUR: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80',
  CITY: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80',
  CULTURAL: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80',
  YATRA: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
  PILGRIMAGE: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
  ADVENTURE: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
  NATURE_WILDLIFE: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&q=80',
  WILDLIFE: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&q=80',
  ROAD_TRIP: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
  HONEYMOON: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&q=80',
  FAMILY: 'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=600&q=80',
  CRUISE: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600&q=80',
  LUXURY: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80',
  BUDGET: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
};

const getCategoryImage = (value: string): string => {
  return categoryImages[value.toUpperCase()] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80';
};

const whyChooseUs = [
  { icon: <Users size={28} />, title: 'Join a Group', description: 'Solo traveller? Join an existing group and split costs — no awkward planning needed.', color: '#0D9488' },
  { icon: <Shield size={28} />, title: 'All-Inclusive Packages', description: 'Transport, stays, food & itinerary sorted. Just book, pack and go.', color: '#134E4A' },
  { icon: <Award size={28} />, title: 'Budget Friendly', description: 'Group pooling means you pay a fraction of solo trip costs. Travel more, spend less.', color: '#F59E0B' },
  { icon: <Compass size={28} />, title: 'Verified Agencies', description: 'Every trip is run by vetted travel agencies with real reviews from past travelers.', color: '#EA580C' },
];


// ========== TRIP CARD COMPONENT ==========
const TripCard = ({ pkg, index, distance, originInItinerary }: { 
  pkg: TravelPackage; 
  index: number;
  distance?: number | null;
  originInItinerary?: boolean;
}) => {
  const hasDiscount = pkg.discountedPrice && pkg.discountedPrice < pkg.price;
  const imageUrl = (pkg.media && pkg.media.length > 0) ? pkg.media[0] : undefined;
  const transportationValue = pkg.transportationLabel || pkg.transportation || pkg.vehicleType;
  const ratingValue = typeof pkg.rating === 'number' ? pkg.rating : Number.NaN;

  const getTransportEmoji = (value?: string) => {
    const upper = (value || '').toUpperCase();
    if (upper.startsWith('FLIGHT')) return '✈️';
    if (upper.startsWith('TRAIN')) return '🚆';
    if (upper.startsWith('BUS')) return '🚌';
    if (upper.startsWith('BIKE')) return '🏍️';
    if (upper.startsWith('SELF')) return '🚶';
    return '🚗';
  };

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
            <ImagePlaceholder
              destination={pkg.destination}
              packageType={pkg.packageTypeLabel || pkg.packageType}
              size="card"
            />
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

          {pkg.postedByName && (
            <Link to={`/user/${pkg.userId}`} className={styles.tripCardPostedBy} onClick={(e) => e.stopPropagation()}>
              {pkg.postedByPhoto ? (
                <img src={pkg.postedByPhoto} alt={pkg.postedByName} className={styles.tripCardPostedByAvatar} />
              ) : (
                <div className={styles.tripCardPostedByFallback}>
                  {pkg.postedByName.trim().charAt(0).toUpperCase()}
                </div>
              )}
              <span className={styles.tripCardPostedByText}>By <strong>{pkg.postedByName}</strong></span>
              {pkg.postedByVerified && <CheckCircle2 size={14} color="#22c55e" />}
              {Number.isFinite(ratingValue) && ratingValue > 0 && (
                <span className={styles.tripCardPostedByRating}>
                  <Star size={11} fill="currentColor" /> {ratingValue.toFixed(1)}
                </span>
              )}
              <ArrowRight size={13} className={styles.tripCardPostedByArrow} />
            </Link>
          )}
          
          <div className={styles.tripCardMeta}>
            {pkg.origin && (
              <span className={styles.tripCardRoute}>
                <MapPin size={14} />
                {pkg.origin} → {pkg.destination}
              </span>
            )}
            {transportationValue && (
              <span className={styles.tripCardTransport}>
                <span className={styles.tripCardTransportIcon}>
                  {pkg.transportationIcon || getTransportEmoji(String(transportationValue))}
                </span>
                <span className={styles.tripCardTransportLabel}>
                  {pkg.transportationLabel || String(transportationValue)}
                </span>
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
  const [searchFromLocation, setSearchFromLocation] = useState<LocationResult | undefined>(undefined);
  const [searchToLocation, setSearchToLocation] = useState<LocationResult | undefined>(undefined);
  const [searchDate, setSearchDate] = useState('');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [filters, setFilters] = useState<PackageFilters>({});
  const [isSearching, setIsSearching] = useState(false);
  const [isNearbySearch, setIsNearbySearch] = useState(false);
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

  const handleSearch = async (filtersOverride?: PackageFilters) => {
    const origin = searchFrom.trim();
    const destination = searchTo.trim();
    const activeFilters = filtersOverride ?? filters;
    // Check if there are any active filters (excluding undefined values)
    const hasFilters = !!(
      (activeFilters.minPrice !== undefined) ||
      (activeFilters.maxPrice !== undefined) ||
      (activeFilters.days !== undefined) ||
      (activeFilters.minDays !== undefined) ||
      (activeFilters.maxDays !== undefined) ||
      (activeFilters.transportation !== undefined) ||
      (activeFilters.featured !== undefined)
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
        results = await packageAPI.searchPackagesNearby(origin, destination, {
          originLat: searchFromLocation?.latitude,
          originLong: searchFromLocation?.longitude,
          destinationLat: searchToLocation?.latitude,
          destinationLong: searchToLocation?.longitude,
        });
      } else if (origin && !destination) {
        setIsNearbySearch(true);
        results = await packageAPI.searchPackagesFromOrigin(origin, {
          originLat: searchFromLocation?.latitude,
          originLong: searchFromLocation?.longitude,
        });
      } else {
        setIsNearbySearch(false);
        const pkgs = hasFilters
          ? await packageAPI.getAllPackages(activeFilters)
          : await packageAPI.searchPackages(destination || '');
        results = pkgs.map(pkg => ({
          packageInfo: pkg,
          distanceFromUserOrigin: null,
          originInItinerary: false
        }));
      }
      
      // Apply filters (client-side for now)
      results = applyFiltersToResults(results, activeFilters);
      
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

  const applyFiltersToResults = (
    results: PackageWithDistanceResponse[],
    activeFilters: PackageFilters,
  ): PackageWithDistanceResponse[] => {
    let filtered = [...results];
    
    // Price filter
    if (activeFilters.minPrice !== undefined || activeFilters.maxPrice !== undefined) {
      filtered = filtered.filter(result => {
        const price = result.packageInfo.discountedPrice || result.packageInfo.price;
        const min = activeFilters.minPrice ?? 0;
        const max = activeFilters.maxPrice ?? Infinity;
        return price >= min && price <= max;
      });
    }
    
    // Duration filter
    if (activeFilters.minDays !== undefined || activeFilters.maxDays !== undefined) {
      filtered = filtered.filter(result => {
        const min = activeFilters.minDays ?? 1;
        const max = activeFilters.maxDays ?? Infinity;
        return result.packageInfo.durationDays >= min && result.packageInfo.durationDays <= max;
      });
    } else if (activeFilters.days !== undefined) {
      filtered = filtered.filter(result => 
        result.packageInfo.durationDays === activeFilters.days
      );
    }
    
    // Transportation filter
    if (activeFilters.transportation) {
      filtered = filtered.filter(result => {
        const transport = result.packageInfo.transportation || result.packageInfo.vehicleType;
        return String(transport || '') === activeFilters.transportation;
      });
    }
    
    // Featured filter
    if (activeFilters.featured) {
      filtered = filtered.filter(result => result.packageInfo.featured === true);
    }
    
    return filtered;
  };

  const handleApplyFilters = (newFilters?: PackageFilters) => {
    setShowFilterSidebar(false);
    if (newFilters) {
      setFilters(newFilters);
      handleSearch(newFilters);
      return;
    }
    // Always run search so filters work even before first search.
    handleSearch();
  };

  const clearSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
    setSearchFrom('');
    setSearchTo('');
    setSearchFromLocation(undefined);
    setSearchToLocation(undefined);
    setSearchDate('');
    setFilters({});
    setShowFilterSidebar(false);
    setIsNearbySearch(false);
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
              Book a Seat. Join the Trip.<br />
              <span className={styles.heroTitleAccent}>Travel Together.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Ready-made group trips designed for smart travelers who want to save and explore more.
            </p>

            {/* Search Box */}
            <div className={styles.searchBoxWrapper}>
            <div className={styles.searchBox}>
              <div className={styles.searchField}>
                <MapPin size={18} className={styles.searchIcon} />
                <LocationAutocomplete
                  value={searchFrom}
                  onChange={(value, location) => {
                    setSearchFrom(value);
                    setSearchFromLocation(location);
                  }}
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
                  onChange={(value, location) => {
                    setSearchTo(value);
                    setSearchToLocation(location);
                  }}
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
              
                <button className={styles.searchBtn} onClick={() => handleSearch()}>
                <Search size={20} />
              </button>
            </div>

            {/* Actions Row (keeps layout clean + better on mobile) */}
            <div className={styles.searchBoxActions}>
              <button
                type="button"
                className={`${styles.filtersPill} ${showFilterSidebar ? styles.filtersPillActive : ''} ${Object.keys(filters).length > 0 ? styles.hasFilters : ''}`}
                onClick={() => setShowFilterSidebar(!showFilterSidebar)}
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
                {Object.keys(filters).length > 0 && <span className={styles.filterCountInline}>{Object.keys(filters).length}</span>}
              </button>
            </div>
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
                  transition={{ delay: index * 0.06 }}
                >
                  <Link to={`/categories/${cat.value}`} className={styles.categoryCard}>
                    <img 
                      src={getCategoryImage(cat.value)} 
                      alt={cat.label}
                      className={styles.categoryImage}
                      loading="lazy"
                    />
                    <div className={styles.categoryOverlay} />
                    <div className={styles.categoryContent}>
                      <h3 className={styles.categoryLabel}>{cat.label}</h3>
                      <span className={styles.categoryArrow}>
                        <ArrowRight size={18} />
                      </span>
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
              <span className={styles.sectionBadge}>Why PoolMyTrips</span>
              <h2 className={styles.sectionTitle}>Travel Cheap. Travel Together.</h2>
              <p className={styles.sectionSubtitle}>
                Find ready-made group trips at shared costs — perfect for solo travellers, friend groups, or anyone who wants a hassle-free getaway.
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
