import { MapPin, Compass, Mountain, TreePalm, Plane } from 'lucide-react';
import styles from './ImagePlaceholder.module.css';

// Deterministic gradient palette — same destination always gets the same colors
const GRADIENT_PALETTES = [
  { from: '#0D9488', to: '#134E4A', accent: '#5EEAD4' },   // Teal depths
  { from: '#0891B2', to: '#164E63', accent: '#67E8F9' },   // Cyan ocean
  { from: '#7C3AED', to: '#4C1D95', accent: '#C4B5FD' },   // Violet dream
  { from: '#2563EB', to: '#1E3A8A', accent: '#93C5FD' },   // Royal blue
  { from: '#059669', to: '#064E3B', accent: '#6EE7B7' },   // Emerald forest
  { from: '#D97706', to: '#92400E', accent: '#FCD34D' },   // Golden sunset
  { from: '#DC2626', to: '#7F1D1D', accent: '#FCA5A5' },   // Ruby
  { from: '#DB2777', to: '#831843', accent: '#F9A8D4' },   // Rose
  { from: '#4F46E5', to: '#312E81', accent: '#A5B4FC' },   // Indigo
  { from: '#EA580C', to: '#7C2D12', accent: '#FDBA74' },   // Warm tangerine
  { from: '#0284C7', to: '#0C4A6E', accent: '#7DD3FC' },   // Sky blue
  { from: '#16A34A', to: '#14532D', accent: '#86EFAC' },   // Green valley
];

// Travel-themed icons pool
const TRAVEL_ICONS = [MapPin, Compass, Mountain, TreePalm, Plane];

// Hash a string to a stable integer
function hashString(str: string): number {
  let hash = 0;
  const normalized = str.toLowerCase().trim();
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit int
  }
  return Math.abs(hash);
}

interface ImagePlaceholderProps {
  destination: string;
  packageType?: string;
  className?: string;
  size?: 'card' | 'hero';
}

export const ImagePlaceholder = ({
  destination,
  packageType,
  className = '',
  size = 'card',
}: ImagePlaceholderProps) => {
  const hash = hashString(destination);
  const palette = GRADIENT_PALETTES[hash % GRADIENT_PALETTES.length];
  const TravelIcon = TRAVEL_ICONS[hash % TRAVEL_ICONS.length];

  const initial = destination.trim().charAt(0).toUpperCase();
  const displayName = destination.length > 24 ? destination.slice(0, 22) + '…' : destination;

  return (
    <div
      className={`${styles.placeholder} ${styles[size]} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
      }}
    >
      {/* Decorative pattern overlay */}
      <div className={styles.patternOverlay} />

      {/* Floating decorative orbs */}
      <div
        className={styles.orb}
        style={{ background: palette.accent, top: '12%', right: '10%', width: '60px', height: '60px' }}
      />
      <div
        className={styles.orb}
        style={{ background: palette.accent, bottom: '15%', left: '8%', width: '40px', height: '40px' }}
      />
      <div
        className={styles.orb}
        style={{ background: palette.from, top: '50%', right: '25%', width: '24px', height: '24px' }}
      />

      {/* Content */}
      <div className={styles.content}>
        {/* Large initial letter */}
        <div className={styles.initialCircle} style={{ borderColor: `${palette.accent}40` }}>
          <span className={styles.initial}>{initial}</span>
        </div>

        {/* Destination name */}
        <span className={styles.destinationName}>{displayName}</span>

        {/* Package type tag */}
        {packageType && (
          <span className={styles.typeTag}>
            <TravelIcon size={size === 'hero' ? 14 : 11} />
            {packageType}
          </span>
        )}
      </div>

      {/* Bottom-right subtle icon watermark */}
      <div className={styles.watermark}>
        <TravelIcon size={size === 'hero' ? 80 : 48} strokeWidth={0.8} />
      </div>
    </div>
  );
};
