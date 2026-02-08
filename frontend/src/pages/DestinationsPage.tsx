import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Star, Search, Compass, Calendar, SlidersHorizontal } from 'lucide-react';
import { packageAPI } from '../services/api';
import { TravelPackage, PackageFilters } from '../types';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { FilterSidebar } from '../components/FilterSidebar';
import styles from './ListingPage.module.css';

const allDestinations = [
  { name: 'Kashmir', slug: 'kashmir', image: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800', description: 'Paradise on Earth' },
  { name: 'Goa', slug: 'goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', description: 'Beach Paradise' },
  { name: 'Kerala', slug: 'kerala', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800', description: 'God\'s Own Country' },
  { name: 'Rajasthan', slug: 'rajasthan', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', description: 'Land of Kings' },
  { name: 'Ladakh', slug: 'ladakh', image: 'https://images.unsplash.com/photo-1626015365107-36a02251e8f2?w=800', description: 'Land of High Passes' },
  { name: 'Andaman', slug: 'andaman', image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800', description: 'Island Getaway' },
  { name: 'Sikkim', slug: 'sikkim', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800', description: 'Hidden Gem of Northeast' },
  { name: 'Himachal', slug: 'himachal', image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800', description: 'Mountain Paradise' },
  { name: 'Varanasi', slug: 'varanasi', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800', description: 'Spiritual Capital' },
];

export const DestinationsPage = () => {
  const { destination } = useParams<{ destination?: string }>();
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [filters, setFilters] = useState<PackageFilters>({});

  const currentDestination = destination 
    ? allDestinations.find(d => d.slug === destination.toLowerCase())
    : null;

  useEffect(() => {
    loadPackages();
  }, [destination]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      if (destination) {
        const results = await packageAPI.searchPackages(destination);
        setPackages(results);
      } else {
        const allPackages = await packageAPI.getAllPackages();
        setPackages(allPackages);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const origin = searchFrom.trim();
    // Check if there are any active filters (excluding undefined values)
    const hasFilters = !!(
      (filters.minPrice !== undefined) ||
      (filters.maxPrice !== undefined) ||
      (filters.days !== undefined) ||
      (filters.transportation !== undefined) ||
      (filters.featured !== undefined)
    );
    
    if (!origin && !searchDate && !hasFilters) {
      loadPackages();
      return;
    }
    
    setLoading(true);
    try {
      let results: TravelPackage[] = [];
      
      if (origin) {
        const searchResults = await packageAPI.searchPackagesFromOrigin(origin);
        results = searchResults.map(r => r.packageInfo);
      } else {
        results = await packageAPI.getAllPackages();
      }
      
      // Filter by destination if on specific destination page
      if (destination) {
        results = results.filter(pkg => 
          pkg.destination.toLowerCase().includes(destination.toLowerCase())
        );
      }
      
      // Apply filters
      results = applyFiltersToResults(results);
      
      // Filter by date if provided
      if (searchDate) {
        results = results.filter(pkg => {
          if (!pkg.startDate) return false;
          const pkgDate = new Date(pkg.startDate);
          const filterDate = new Date(searchDate);
          return pkgDate >= filterDate;
        });
      }
      
      setPackages(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersToResults = (results: TravelPackage[]): TravelPackage[] => {
    let filtered = [...results];
    
    // Price filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filtered = filtered.filter(pkg => {
        const price = pkg.discountedPrice || pkg.price;
        const min = filters.minPrice ?? 0;
        const max = filters.maxPrice ?? Infinity;
        return price >= min && price <= max;
      });
    }
    
    // Duration filter
    if (filters.days !== undefined) {
      filtered = filtered.filter(pkg => 
        pkg.durationDays === filters.days
      );
    }
    
    // Transportation filter
    if (filters.transportation) {
      filtered = filtered.filter(pkg => 
        pkg.vehicleType === filters.transportation
      );
    }
    
    // Featured filter
    if (filters.featured) {
      filtered = filtered.filter(pkg => pkg.featured === true);
    }
    
    return filtered;
  };

  const handleApplyFilters = () => {
    setShowFilterSidebar(false);
    handleSearch();
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img 
            src={currentDestination?.image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920'} 
            alt={currentDestination?.name || 'Destinations'}
          />
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className={styles.badge}>
              <MapPin size={14} /> {destination ? 'Destination' : 'All Destinations'}
            </span>
            <h1>{currentDestination?.name || 'Explore Destinations'}</h1>
            <p>{currentDestination?.description || 'Discover amazing places across India'}</p>
            
            {/* Search Bar */}
            <div className={styles.searchBox}>
              <div className={styles.searchField}>
                <MapPin size={18} className={styles.searchIcon} />
                <LocationAutocomplete
                  value={searchFrom}
                  onChange={(value) => setSearchFrom(value)}
                  placeholder="Search from your city"
                  showIcon={false}
                  inputClassName={styles.searchInput}
                />
              </div>
              
              <div className={styles.searchDivider} />
              
              <div className={styles.dateField} onClick={() => (document.getElementById('destDatePicker') as HTMLInputElement)?.showPicker()}>
                <Calendar size={18} className={styles.dateIcon} />
                <input
                  id="destDatePicker"
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
      </section>

      {/* Destination Filters (if showing all) */}
      {!destination && (
        <section className={styles.filtersSection}>
          <div className={styles.container}>
            <div className={styles.destinationsGrid}>
              {allDestinations.map((dest, index) => (
                <motion.div
                  key={dest.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/destinations/${dest.slug}`} className={styles.destinationCard}>
                    <img src={dest.image} alt={dest.name} />
                    <div className={styles.destinationOverlay} />
                    <div className={styles.destinationInfo}>
                      <h3>{dest.name}</h3>
                      <span>{dest.description}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Packages */}
      <section className={styles.packagesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>{destination ? `Trips to ${currentDestination?.name}` : 'All Available Trips'}</h2>
            <span className={styles.count}>{packages.length} trips found</span>
          </div>

          {loading ? (
            <div className={styles.loadingGrid}>
              {[...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : packages.length > 0 ? (
            <div className={styles.packagesGrid}>
              {packages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/package/${pkg.id}`} className={styles.packageCard}>
                    <div className={styles.packageImage}>
                      <img 
                        src={pkg.coverImage || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'} 
                        alt={pkg.title}
                      />
                      <span className={styles.durationBadge}>
                        {pkg.durationDays}D{pkg.durationNights ? `/${pkg.durationNights}N` : ''}
                      </span>
                    </div>
                    <div className={styles.packageContent}>
                      <h3>{pkg.title}</h3>
                      <div className={styles.packageMeta}>
                        <span><MapPin size={14} /> {pkg.destination}</span>
                        {pkg.transportationIcon && pkg.transportationLabel && (
                          <span>{pkg.transportationIcon} {pkg.transportationLabel}</span>
                        )}
                        {pkg.rating && <span><Star size={14} fill="currentColor" /> {pkg.rating}</span>}
                      </div>
                      <div className={styles.packageFooter}>
                        <div className={styles.price}>
                          <span>Starts From</span>
                          <strong>₹{(pkg.discountedPrice || pkg.price).toLocaleString()}</strong>
                        </div>
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <MapPin size={48} />
              <h3>No trips found</h3>
              <p>Check back soon for new adventures!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
