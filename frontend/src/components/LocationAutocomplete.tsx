import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import styles from './LocationAutocomplete.module.css';

// ==================== TYPES ====================

export interface LocationResult {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

interface Props {
  value: string;
  onChange: (value: string, location?: LocationResult) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  showIcon?: boolean;
}

// ==================== MAIN COMPONENT ====================

export const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = 'Enter location...',
  className = '',
  inputClassName = '',
  required = false,
  showIcon = true,
}: Props) => {
  
  // -------- State --------
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  // -------- Refs --------
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // ==================== EFFECTS ====================

  // Sync input with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== API CALL ====================

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=en`;
      const response = await fetch(url);
      const data = await response.json();

      // Parse API response into our format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results: LocationResult[] = (data.features || []).map((item: any) => {
        const props = item.properties;
        const [lng, lat] = item.geometry.coordinates;
        
        // Build readable display name
        const parts = [props.name, props.city, props.state, props.country].filter(Boolean);
        const uniqueParts = [...new Set(parts)]; // Remove duplicates
        
        return {
          name: props.name || props.city || props.state || 'Unknown',
          displayName: uniqueParts.join(', '),
          latitude: lat,
          longitude: lng,
        };
      });

      setSuggestions(results);
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.error('Location search failed:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== HANDLERS ====================

  // Handle typing in input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1);
    onChange(newValue); // Update parent without coordinates

    // Debounce: Wait 300ms after user stops typing before searching
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  // Handle selecting a suggestion
  const handleSelect = (location: LocationResult) => {
    setInputValue(location.name);
    onChange(location.name, location); // Update parent WITH coordinates
    setSuggestions([]);
    setShowDropdown(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Handle clear button
  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
  };

  // ==================== RENDER ====================

  return (
    <div className={`${styles.wrapper} ${className}`} ref={wrapperRef}>
      
      {/* Input Field */}
      <div className={styles.inputWrapper}>
        {showIcon && (
          <span className={styles.icon}>
            <MapPin size={18} />
          </span>
        )}
        
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length >= 2 && suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className={`${styles.input} ${showIcon ? styles.inputWithIcon : ''} ${inputClassName}`}
          required={required}
          autoComplete="off"
        />
        
        {/* Loading Spinner */}
        {isLoading && (
          <span className={styles.loadingIcon}>
            <Loader2 size={16} className={styles.spinner} />
          </span>
        )}
        
        {/* Clear Button */}
        {inputValue && !isLoading && (
          <button type="button" className={styles.clearBtn} onClick={handleClear}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className={styles.suggestions}>
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.latitude}-${suggestion.longitude}`}
              type="button"
              className={`${styles.suggestionItem} ${index === highlightedIndex ? styles.selected : ''}`}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <MapPin size={14} className={styles.suggestionIcon} />
              <div className={styles.suggestionText}>
                <span className={styles.suggestionName}>{suggestion.name}</span>
                <span className={styles.suggestionDetails}>{suggestion.displayName}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
