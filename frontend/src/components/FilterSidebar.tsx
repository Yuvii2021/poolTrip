import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, Calendar, Truck, Star } from 'lucide-react';
import { FilterOptionsResponse, PackageFilters } from '../types';
import { packageAPI } from '../services/api';
import styles from './FilterSidebar.module.css';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: PackageFilters;
  onFiltersChange: (filters: PackageFilters) => void;
  onApplyFilters: (newFilters?: PackageFilters) => void;
}

export const FilterSidebar = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
}: FilterSidebarProps) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [durationRange, setDurationRange] = useState<[number, number]>([1, 30]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    if (filterOptions?.priceRange) {
      const min = filterOptions.priceRange.min;
      const max = filterOptions.priceRange.max;
      // Always initialize with full range when filter options load
      if (max >= min) {
        setPriceRange([min, max]);
      }
    }
    if (filterOptions?.durationOptions && filterOptions.durationOptions.length > 0) {
      const minDuration = Math.min(...filterOptions.durationOptions);
      const maxDuration = Math.max(...filterOptions.durationOptions);
      // Always initialize with full range when filter options load
      if (maxDuration >= minDuration) {
        setDurationRange([minDuration, maxDuration]);
      }
    }
  }, [filterOptions]);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const options = await packageAPI.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceRangeChange = (index: number, value: number) => {
    setPriceRange((prevRange) => {
      const maxPrice = filterOptions?.priceRange?.max || 100000;
      const minPrice = filterOptions?.priceRange?.min || 0;
      
      // Clamp value to valid range
      const clampedValue = Math.max(minPrice, Math.min(maxPrice, value));
      
      if (index === 0) {
        // Min slider - can't exceed max, but can equal it
        return [Math.min(clampedValue, prevRange[1]), prevRange[1]];
      } else {
        // Max slider - can't go below min, but can equal it
        return [prevRange[0], Math.max(clampedValue, prevRange[0])];
      }
    });
  };


  const handleTransportationChange = (value: string) => {
    onFiltersChange({
      ...filters,
      transportation: filters.transportation === value ? undefined : value,
    });
  };

  const handleDurationRangeChange = (index: number, value: number) => {
    setDurationRange((prevRange) => {
      const minDur = filterOptions?.durationOptions ? Math.min(...filterOptions.durationOptions) : 1;
      const maxDur = filterOptions?.durationOptions ? Math.max(...filterOptions.durationOptions) : 30;
      
      // Clamp value to valid range
      const clampedValue = Math.max(minDur, Math.min(maxDur, value));
      
      if (index === 0) {
        // Min slider - can't exceed max, but can equal it
        return [Math.min(clampedValue, prevRange[1]), prevRange[1]];
      } else {
        // Max slider - can't go below min, but can equal it
        return [prevRange[0], Math.max(clampedValue, prevRange[0])];
      }
    });
  };

  const handleFeaturedToggle = () => {
    onFiltersChange({
      ...filters,
      featured: filters.featured ? undefined : true,
    });
  };

  const clearAllFilters = () => {
    if (filterOptions?.priceRange) {
      const min = filterOptions.priceRange.min;
      const max = filterOptions.priceRange.max;
      // Reset to show full range but keep them separate
      setPriceRange([min, max]);
    }
    if (filterOptions?.durationOptions && filterOptions.durationOptions.length > 0) {
      const minDuration = Math.min(...filterOptions.durationOptions);
      const maxDuration = Math.max(...filterOptions.durationOptions);
      setDurationRange([minDuration, maxDuration]);
    }
    // Clear all filters by setting an empty object
    onFiltersChange({});
    // Trigger search to refresh results
    onApplyFilters();
  };

  const hasActiveFilters = () => {
    return !!(
      (filters.minPrice !== filterOptions?.priceRange?.min) ||
      (filters.maxPrice !== filterOptions?.priceRange?.max) ||
      filters.days ||
      filters.minDays !== undefined ||
      filters.maxDays !== undefined ||
      filters.transportation ||
      filters.featured
    );
  };

  if (loading) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className={styles.sidebar}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.loading}>Loading filters...</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) {
                onClose();
              }
            }}
          />
          <motion.div
            className={styles.sidebar}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerTitle}>
                <SlidersHorizontal size={20} />
                <h2>Filters</h2>
              </div>
              <button 
                className={styles.closeBtn} 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (onClose) {
                    onClose();
                  }
                }}
                type="button"
                aria-label="Close filters"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.content}>
              {/* Price Range */}
              {filterOptions?.priceRange && (
                <div className={styles.filterSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.rupeeIcon}>₹</span>
                    <h3>Price Range</h3>
                  </div>
                  
                  {/* Price Range Slider */}
                  <div className={styles.sliderContainer}>
                    <div className={styles.sliderLabels}>
                      <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
                      <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
                    </div>
                    <div className={styles.rangeSliderWrapper}>
                      <div className={styles.sliderTrack} />
                      {(() => {
                        const totalRange = filterOptions.priceRange.max - filterOptions.priceRange.min;
                        if (totalRange <= 0) {
                          return (
                            <div 
                              className={styles.sliderRange}
                              style={{
                                left: '10px',
                                width: 'calc(100% - 20px)'
                              }}
                            />
                          );
                        }
                        const minPercent = (priceRange[0] - filterOptions.priceRange.min) / totalRange;
                        const maxPercent = (priceRange[1] - filterOptions.priceRange.min) / totalRange;
                        const rangeWidthPercent = maxPercent - minPercent;
                        // Calculate: left = 10px + minPercent * (100% - 20px)
                        // Simplified: left = 10px + minPercent * 100% - minPercent * 20px
                        const leftCalc = `calc(10px + ${minPercent * 100}% - ${minPercent * 20}px)`;
                        const widthCalc = `calc(${rangeWidthPercent * 100}% - ${rangeWidthPercent * 20}px)`;
                        return (
                          <div 
                            className={styles.sliderRange}
                            style={{
                              left: leftCalc,
                              width: widthCalc
                            }}
                          />
                        );
                      })()}
                      <input
                        key={`price-min-${filterOptions.priceRange.min}-${filterOptions.priceRange.max}`}
                        type="range"
                        min={filterOptions.priceRange.min}
                        max={filterOptions.priceRange.max}
                        step={(() => {
                          const range = filterOptions.priceRange.max - filterOptions.priceRange.min;
                          if (range <= 0) return 1;
                          // Calculate step: divide range by 200, but ensure it's at least 1 and not too large
                          const calculatedStep = Math.floor(range / 200);
                          return Math.max(1, Math.min(calculatedStep, 1000));
                        })()}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (!isNaN(val)) {
                            handlePriceRangeChange(0, val);
                          }
                        }}
                        onInput={(e) => {
                          const val = Number((e.target as HTMLInputElement).value);
                          if (!isNaN(val)) {
                            handlePriceRangeChange(0, val);
                          }
                        }}
                        className={`${styles.rangeSlider} ${styles.rangeSliderMin}`}
                      />
                      <input
                        key={`price-max-${filterOptions.priceRange.min}-${filterOptions.priceRange.max}`}
                        type="range"
                        min={filterOptions.priceRange.min}
                        max={filterOptions.priceRange.max}
                        step={(() => {
                          const range = filterOptions.priceRange.max - filterOptions.priceRange.min;
                          if (range <= 0) return 1;
                          // Calculate step: divide range by 200, but ensure it's at least 1 and not too large
                          const calculatedStep = Math.floor(range / 200);
                          return Math.max(1, Math.min(calculatedStep, 1000));
                        })()}
                        value={priceRange[1]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (!isNaN(val)) {
                            handlePriceRangeChange(1, val);
                          }
                        }}
                        onInput={(e) => {
                          const val = Number((e.target as HTMLInputElement).value);
                          if (!isNaN(val)) {
                            handlePriceRangeChange(1, val);
                          }
                        }}
                        className={`${styles.rangeSlider} ${styles.rangeSliderMax}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Duration */}
              {filterOptions?.durationOptions && filterOptions.durationOptions.length > 0 && (
                <div className={styles.filterSection}>
                  <div className={styles.sectionHeader}>
                    <Calendar size={18} />
                    <h3>Duration (Days)</h3>
                  </div>
                  <div className={styles.sliderContainer}>
                    <div className={styles.sliderLabels}>
                      <span>{durationRange[0]} {durationRange[0] === 1 ? 'Day' : 'Days'}</span>
                      <span>{durationRange[1]} {durationRange[1] === 1 ? 'Day' : 'Days'}</span>
                    </div>
                    <div className={styles.rangeSliderWrapper}>
                      <div className={styles.sliderTrack} />
                      {(() => {
                        const minDur = Math.min(...filterOptions.durationOptions);
                        const maxDur = Math.max(...filterOptions.durationOptions);
                        const totalRange = maxDur - minDur;
                        if (totalRange <= 0) return null;
                        const minPercent = (durationRange[0] - minDur) / totalRange;
                        const maxPercent = (durationRange[1] - minDur) / totalRange;
                        const rangeWidthPercent = maxPercent - minPercent;
                        // Calculate: left = 10px + minPercent * (100% - 20px)
                        // Simplified: left = 10px + minPercent * 100% - minPercent * 20px
                        const leftCalc = `calc(10px + ${minPercent * 100}% - ${minPercent * 20}px)`;
                        const widthCalc = `calc(${rangeWidthPercent * 100}% - ${rangeWidthPercent * 20}px)`;
                        return (
                          <div 
                            className={styles.sliderRange}
                            style={{
                              left: leftCalc,
                              width: widthCalc
                            }}
                          />
                        );
                      })()}
                      <input
                        key={`duration-min-${Math.min(...filterOptions.durationOptions)}-${Math.max(...filterOptions.durationOptions)}`}
                        type="range"
                        min={Math.min(...filterOptions.durationOptions)}
                        max={Math.max(...filterOptions.durationOptions)}
                        step={1}
                        value={durationRange[0]}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                            handleDurationRangeChange(0, val);
                          }
                        }}
                        onInput={(e) => {
                          const val = parseInt((e.target as HTMLInputElement).value, 10);
                          if (!isNaN(val)) {
                            handleDurationRangeChange(0, val);
                          }
                        }}
                        className={`${styles.rangeSlider} ${styles.rangeSliderMin}`}
                      />
                      <input
                        key={`duration-max-${Math.min(...filterOptions.durationOptions)}-${Math.max(...filterOptions.durationOptions)}`}
                        type="range"
                        min={Math.min(...filterOptions.durationOptions)}
                        max={Math.max(...filterOptions.durationOptions)}
                        step={1}
                        value={durationRange[1]}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                            handleDurationRangeChange(1, val);
                          }
                        }}
                        onInput={(e) => {
                          const val = parseInt((e.target as HTMLInputElement).value, 10);
                          if (!isNaN(val)) {
                            handleDurationRangeChange(1, val);
                          }
                        }}
                        className={`${styles.rangeSlider} ${styles.rangeSliderMax}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Transportation */}
              {filterOptions?.transportationOptions && filterOptions.transportationOptions.length > 0 && (
                <div className={styles.filterSection}>
                  <div className={styles.sectionHeader}>
                    <Truck size={18} />
                    <h3>Transportation</h3>
                  </div>
                  <div className={styles.optionsGrid}>
                    {filterOptions.transportationOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`${styles.optionBtn} ${
                          filters.transportation === option.value ? styles.optionBtnActive : ''
                        }`}
                        onClick={() => handleTransportationChange(option.value)}
                      >
                        <span className={styles.optionIcon}>{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured */}
              <div className={styles.filterSection}>
                <div className={styles.sectionHeader}>
                  <Star size={18} />
                  <h3>Featured Packages</h3>
                </div>
                <button
                  className={`${styles.toggleBtn} ${
                    filters.featured ? styles.toggleBtnActive : ''
                  }`}
                  onClick={handleFeaturedToggle}
                >
                  <span className={styles.toggleSlider} />
                  <span className={styles.toggleLabel}>
                    {filters.featured ? 'Show Only Featured' : 'Show All'}
                  </span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              {hasActiveFilters() && (
                <button className={styles.clearBtn} onClick={clearAllFilters}>
                  Clear All
                </button>
              )}
              <button 
                className={styles.applyBtn} 
                onClick={() => {
                  // Only set price filters if they differ from the default range
                  const defaultMin = filterOptions?.priceRange?.min || 0;
                  const defaultMax = filterOptions?.priceRange?.max || 100000;
                  const isPriceFiltered = priceRange[0] !== defaultMin || priceRange[1] !== defaultMax;
                  
                  // Only set duration filter if range is narrowed to a single value
                  const minDur = filterOptions?.durationOptions ? Math.min(...filterOptions.durationOptions) : 1;
                  const maxDur = filterOptions?.durationOptions ? Math.max(...filterOptions.durationOptions) : 30;
                  const isDurationFiltered = durationRange[0] !== minDur || durationRange[1] !== maxDur;
                  
                  // Build new filters object, explicitly removing price/duration if not filtered
                  const newFilters: PackageFilters = {};
                  
                  // Only add filters that are actually set
                  if (filters.transportation) {
                    newFilters.transportation = filters.transportation;
                  }
                  if (filters.featured !== undefined && filters.featured) {
                    newFilters.featured = filters.featured;
                  }
                  
                  // Only add price filters if they differ from default
                  if (isPriceFiltered) {
                    newFilters.minPrice = priceRange[0];
                    newFilters.maxPrice = priceRange[1];
                  }
                  
                  // Add duration filter - support range filtering
                  if (isDurationFiltered) {
                    if (durationRange[0] === durationRange[1]) {
                      // Exact match
                      newFilters.days = durationRange[0];
                    } else {
                      // Range filter
                      newFilters.minDays = durationRange[0];
                      newFilters.maxDays = durationRange[1];
                    }
                  }
                  
                  // Update filters with current slider values before applying
                  onFiltersChange(newFilters);
                  // Pass newFilters directly to avoid state update timing issues
                  onApplyFilters(newFilters);
                }}
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
