import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Star, Compass, Search, Calendar, SlidersHorizontal } from 'lucide-react';
import { packageAPI } from '../services/api';
import { TravelPackage, PackageFilters, PackageTypeOption } from '../types';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { FilterSidebar } from '../components/FilterSidebar';
import styles from './ListingPage.module.css';

export const CategoriesPage = () => {
  const { category } = useParams<{ category?: string }>();
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [packageTypes, setPackageTypes] = useState<PackageTypeOption[]>([]);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [filters, setFilters] = useState<PackageFilters>({});

  // Helper function to check if there are active filters
  const hasActiveFilters = (): boolean => {
    return !!(
      (filters.minPrice !== undefined) ||
      (filters.maxPrice !== undefined) ||
      (filters.days !== undefined) ||
      (filters.minDays !== undefined) ||
      (filters.maxDays !== undefined) ||
      (filters.transportation !== undefined) ||
      (filters.featured !== undefined)
    );
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const loadFilterOptions = async () => {
    try {
      const options = await packageAPI.getFilterOptions();
      setPackageTypes(options.packageTypes || []);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const currentCategory = category 
    ? packageTypes.find(c => c.value === category.toUpperCase())
    : null;

  const loadPackages = async () => {
    setLoading(true);
    try {
      const hasFilters = hasActiveFilters();
      // Only pass filters if they are actually set
      const filtersToUse = hasFilters ? filters : undefined;
      
      if (category) {
        const results = await packageAPI.getPackagesByType(category.toUpperCase(), filtersToUse);
        setPackages(results);
      } else {
        const allPackages = await packageAPI.getAllPackages(filtersToUse);
        setPackages(allPackages);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (filtersOverride?: PackageFilters) => {
    const origin = searchFrom.trim();
    // Use override filters if provided, otherwise use state filters
    const filtersToCheck = filtersOverride !== undefined ? filtersOverride : filters;
    const hasFilters = filtersToCheck && (
      (filtersToCheck.minPrice !== undefined) ||
      (filtersToCheck.maxPrice !== undefined) ||
      (filtersToCheck.days !== undefined) ||
      (filtersToCheck.transportation !== undefined) ||
      (filtersToCheck.featured !== undefined)
    );
    const filtersToUse = hasFilters ? filtersToCheck : undefined;
    
    setLoading(true);
    try {
      let results: TravelPackage[] = [];
      
      if (origin) {
        // When origin is provided, we still need to do client-side filtering
        // since searchPackagesFromOrigin doesn't support filters yet
        const searchResults = await packageAPI.searchPackagesFromOrigin(origin);
        results = searchResults.map(r => r.packageInfo);
        
        // Filter by category if on specific category page
        if (category) {
          results = results.filter(pkg => 
            pkg.packageType === category.toUpperCase()
          );
        }
        
        // Apply filters client-side (since origin search doesn't support backend filters yet)
        if (filtersToUse) {
          // Use override filters if provided
          if (filtersOverride) {
            results = applyFiltersToResultsWithFilters(results, filtersOverride);
          } else {
            results = applyFiltersToResults(results);
          }
        }
      } else {
        // No origin - use backend filtering
        if (category) {
          results = await packageAPI.getPackagesByType(category.toUpperCase(), filtersToUse);
        } else {
          results = await packageAPI.getAllPackages(filtersToUse);
        }
      }
      
      // Filter by date if provided (client-side, as date filtering isn't in backend yet)
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
  
  const applyFiltersToResultsWithFilters = (results: TravelPackage[], filterOverrides: PackageFilters): TravelPackage[] => {
    let filtered = [...results];
    
    // Price filter
    if (filterOverrides.minPrice !== undefined || filterOverrides.maxPrice !== undefined) {
      filtered = filtered.filter(pkg => {
        const price = pkg.discountedPrice || pkg.price;
        const min = filterOverrides.minPrice ?? 0;
        const max = filterOverrides.maxPrice ?? Infinity;
        return price >= min && price <= max;
      });
    }
    
    // Duration filter - support both exact match and range
    if (filterOverrides.minDays !== undefined || filterOverrides.maxDays !== undefined) {
      filtered = filtered.filter(pkg => {
        const min = filterOverrides.minDays ?? 1;
        const max = filterOverrides.maxDays ?? Infinity;
        return pkg.durationDays >= min && pkg.durationDays <= max;
      });
    } else if (filterOverrides.days !== undefined) {
      // Legacy exact match support
      filtered = filtered.filter(pkg => 
        pkg.durationDays === filterOverrides.days
      );
    }
    
    // Transportation filter
    if (filterOverrides.transportation) {
      filtered = filtered.filter(pkg => 
        pkg.vehicleType === filterOverrides.transportation
      );
    }
    
    // Featured filter
    if (filterOverrides.featured !== undefined && filterOverrides.featured) {
      filtered = filtered.filter(pkg => pkg.featured === true);
    }
    
    return filtered;
  };

  const applyFiltersToResults = (results: TravelPackage[]): TravelPackage[] => {
    let filtered = [...results];
    
    // Price filter - only apply if both min and max are explicitly set, or if one is set
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filtered = filtered.filter(pkg => {
        const price = pkg.discountedPrice || pkg.price;
        const min = filters.minPrice ?? 0;
        const max = filters.maxPrice ?? Infinity;
        const passes = price >= min && price <= max;
        return passes;
      });
    }
    
    // Duration filter - support both exact match and range
    if (filters.minDays !== undefined || filters.maxDays !== undefined) {
      filtered = filtered.filter(pkg => {
        const min = filters.minDays ?? 1;
        const max = filters.maxDays ?? Infinity;
        return pkg.durationDays >= min && pkg.durationDays <= max;
      });
    } else if (filters.days !== undefined) {
      // Legacy exact match support
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
    if (filters.featured !== undefined && filters.featured) {
      filtered = filtered.filter(pkg => pkg.featured === true);
    }
    
    return filtered;
  };

  const handleApplyFilters = (newFilters?: PackageFilters) => {
    setShowFilterSidebar(false);
    // If newFilters provided, use them directly; otherwise use state filters
    if (newFilters !== undefined) {
      handleSearch(newFilters);
    } else {
      // Small delay to ensure state is updated
      setTimeout(() => {
        handleSearch();
      }, 50);
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img 
            src={'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920'} 
            alt={currentCategory?.label || 'Categories'}
          />
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className={styles.badge}>
              <Compass size={14} /> {category ? 'Category' : 'All Categories'}
            </span>
            <h1>
              {currentCategory ? (
                <><span className={styles.emoji}>{currentCategory.icon}</span> {currentCategory.label}</>
              ) : 'Tour Categories'}
            </h1>
            <p>{currentCategory?.label ? `Explore ${currentCategory.label} packages` : 'Find your perfect travel style'}</p>
            
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
              
              <div className={styles.dateField} onClick={() => (document.getElementById('catDatePicker') as HTMLInputElement)?.showPicker()}>
                <Calendar size={18} className={styles.dateIcon} />
                <input
                  id="catDatePicker"
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className={`${styles.dateInput} ${!searchDate ? styles.dateEmpty : ''}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {!searchDate && <span className={styles.datePlaceholder}>Departure</span>}
              </div>
              
              <button 
                className={`${styles.filterBtn} ${showFilterSidebar ? styles.filterBtnActive : ''} ${hasActiveFilters() ? styles.hasFilters : ''}`}
                onClick={() => setShowFilterSidebar(!showFilterSidebar)}
              >
                <SlidersHorizontal size={18} />
                {hasActiveFilters() && (
                  <span className={styles.filterCount}>
                    {[
                      filters.minPrice !== undefined || filters.maxPrice !== undefined,
                      filters.days !== undefined,
                      filters.transportation !== undefined,
                      filters.featured !== undefined
                    ].filter(Boolean).length}
                  </span>
                )}
              </button>
              
              <button className={styles.searchBtn} onClick={() => handleSearch()}>
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

      {/* Category Filters (if showing all) */}
      {!category && (
        <section className={styles.filtersSection}>
          <div className={styles.container}>
            <div className={styles.categoriesGrid}>
              {packageTypes.map((cat, index) => (
                <motion.div
                  key={cat.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/categories/${cat.value}`} className={styles.categoryCard}>
                    <div className={styles.categoryImagePlaceholder} />
                    <div className={styles.categoryOverlay} />
                    <div className={styles.categoryInfo}>
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

      {/* Packages */}
      <section className={styles.packagesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>{category ? `${currentCategory?.label || category} Trips` : 'All Trips & Packages'}</h2>
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
              <Compass size={48} />
              <h3>No trips found</h3>
              <p>Check back soon for new adventures!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
