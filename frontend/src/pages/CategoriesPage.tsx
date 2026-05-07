import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Star, Compass, Search, Calendar, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { packageAPI } from '../services/api';
import { TravelPackage, PackageFilters, PackageTypeOption } from '../types';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { FilterSidebar } from '../components/FilterSidebar';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import styles from './ListingPage.module.css';

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
      (filtersToCheck.minDays !== undefined) ||
      (filtersToCheck.maxDays !== undefined) ||
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
      filtered = filtered.filter(pkg => {
        const transport = pkg.transportation || pkg.vehicleType;
        return String(transport || '') === filterOverrides.transportation;
      });
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
      filtered = filtered.filter(pkg => {
        const transport = pkg.transportation || pkg.vehicleType;
        return String(transport || '') === filters.transportation;
      });
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
            {/* <span className={styles.badge}>
              <Compass size={14} /> {category ? 'Category' : 'All Categories'}
            </span> */}
            <h1>
              {currentCategory ? (
                <><span className={styles.emoji}>{currentCategory.icon}</span> {currentCategory.label}</>
              ) : 'Tour Categories'}
            </h1>
            <p>{currentCategory?.label ? `Explore ${currentCategory.label} packages` : 'Find your perfect travel style'}</p>
            
            {/* Search Bar */}
            <div className={styles.searchBoxWrapper}>
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

              <button className={styles.searchBtn} onClick={() => handleSearch()}>
                <Search size={20} />
              </button>
            </div>

            <div className={styles.searchBoxActions}>
              <button
                type="button"
                className={`${styles.filtersPill} ${showFilterSidebar ? styles.filtersPillActive : ''} ${hasActiveFilters() ? styles.hasFilters : ''}`}
                onClick={() => setShowFilterSidebar(!showFilterSidebar)}
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
                {hasActiveFilters() && (
                  <span className={styles.filterCountInline}>
                    {[
                      filters.minPrice !== undefined || filters.maxPrice !== undefined,
                      filters.days !== undefined || filters.minDays !== undefined || filters.maxDays !== undefined,
                      filters.transportation !== undefined,
                      filters.featured !== undefined
                    ].filter(Boolean).length}
                  </span>
                )}
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
                    <img 
                      src={getCategoryImage(cat.value)} 
                      alt={cat.label}
                      loading="lazy"
                    />
                    <div className={styles.categoryOverlay} />
                    <div className={styles.categoryInfo}>
                      <h3>{cat.label}</h3>
                      <span className={styles.categoryArrowIcon}>
                        <ArrowRight size={16} />
                      </span>
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
                      {(pkg.media && pkg.media.length > 0) ? (
                        <img 
                          src={pkg.media[0]} 
                          alt={pkg.title}
                        />
                      ) : (
                        <ImagePlaceholder
                          destination={pkg.destination}
                          packageType={pkg.packageTypeLabel || pkg.packageType}
                          size="card"
                        />
                      )}
                      <span className={styles.durationBadge}>
                        {pkg.durationDays}D{pkg.durationNights ? `/${pkg.durationNights}N` : ''}
                      </span>
                    </div>
                    <div className={styles.packageContent}>
                      <h3>{pkg.title}</h3>
                      {pkg.postedByName && (
                        <Link to={`/user/${pkg.userId}`} className={styles.postedByRow} onClick={(e) => e.stopPropagation()}>
                          {pkg.postedByPhoto ? (
                            <img src={pkg.postedByPhoto} alt={pkg.postedByName} className={styles.postedByAvatar} />
                          ) : (
                            <div className={styles.postedByFallback}>
                              {pkg.postedByName.trim().charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span>By <strong>{pkg.postedByName}</strong></span>
                          {pkg.postedByVerified && (
                            <span className={styles.postedByCheck} title="Verified profile">
                              <CheckCircle2 size={14} />
                            </span>
                          )}
                          {Number(pkg.rating) > 0 && (
                            <span className={styles.postedByRating}>
                              <Star size={11} fill="currentColor" /> {pkg.rating!.toFixed(1)}
                            </span>
                          )}
                          <ArrowRight size={13} className={styles.postedByArrow} />
                        </Link>
                      )}
                      <div className={styles.packageMeta}>
                        <span><MapPin size={14} /> {pkg.destination}</span>
                        {pkg.transportationIcon && pkg.transportationLabel && (
                          <span>{pkg.transportationIcon} {pkg.transportationLabel}</span>
                        )}
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
