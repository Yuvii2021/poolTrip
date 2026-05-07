export type UserRole = 'USER' | 'AGENCY';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  agencyName?: string;
  agencyDescription?: string;
  whatsappNumber?: string;
  city?: string;
  bio?: string;
  profilePhoto?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  agencyName?: string;
  whatsappNumber?: string;
}

export type PackageType = 
  | 'ADVENTURE' 
  | 'BEACH' 
  | 'CULTURAL' 
  | 'HONEYMOON' 
  | 'FAMILY' 
  | 'PILGRIMAGE' 
  | 'WILDLIFE' 
  | 'CRUISE' 
  | 'LUXURY' 
  | 'BUDGET';

export type VehicleType = 'CAR' | 'SUV' | 'BUS' | 'MINI_BUS' | 'TEMPO' | 'TRAIN' | 'FLIGHT' | 'BIKE' | 'SELF' | 
  'CAR_SUV' | 'BUS_AC' | 'BUS_NON_AC' | 'FLIGHT_ECONOMY' | 'FLIGHT_BUSINESS';

export type PoolType = 'RIDE_POOL' | 'TRIP_PACKAGE';

export type PackageStatus = 'ACTIVE' | 'INACTIVE' | 'SOLDOUT' | 'EXPIRED';

export interface TravelPackage {
  id: number;
  title: string;
  destination: string;
  origin?: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  durationDays: number;
  durationNights?: number;
  startDate?: string;
  totalSeats: number;
  availableSeats: number;
  packageType: PackageType;
  packageTypeLabel?: string; // Display label from backend
  packageTypeIcon?: string; // Display icon/emoji from backend
  vehicleType?: VehicleType;
  transportation?: string; // Backend sends this as Transportation enum (e.g., BUS_AC, CAR_SUV, FLIGHT_ECONOMY)
  transportationLabel?: string; // Display label from backend
  transportationIcon?: string; // Display icon/emoji from backend
  poolType?: PoolType;
  status: PackageStatus;
  media?: string[]; // All media URLs (images + videos)
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: string[];
  termsAndConditions?: string;
  cancellationPolicy?: string;
  featured: boolean;
  instantBooking?: boolean;
  rating?: number;
  reviewCount?: number;
  postedByName?: string;
  postedByPhoto?: string;
  postedByVerified?: boolean;
  postedByVerificationPercent?: number;
  userId: number;
  agencyId: number;
  agencyName?: string;
  agencyPhone?: string;
  agencyWhatsapp?: string;
  createdAt: string;
  // Pooling specific
  departureTime?: string;
  pickupPoints?: string[];
  isVerified?: boolean;
}

export interface PackageRequest {
  title: string;
  destination: string;
  destinationLatitude?: number;
  destinationLongitude?: number;
  origin?: string;
  originLatitude?: number;
  originLongitude?: number;
  description?: string;
  price: number;
  discountedPrice?: number;
  durationDays: number;
  durationNights?: number;
  startDate?: string;
  totalSeats: number;
  packageType: PackageType;
  transportation?: string; // Maps to backend Transportation enum
  poolType?: PoolType;
  existingMediaUrls?: string[]; // Already-uploaded Cloudinary URLs to retain (for edit)
  inclusions?: string;
  exclusions?: string;
  itinerary?: string[];
  termsAndConditions?: string;
  cancellationPolicy?: string;
  featured?: boolean;
  instantBooking?: boolean;
  departureTime?: string;
  pickupPoints?: string;
}

// Booking Types
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';

export interface BookingRequest {
  packageId: number;
  seats: number;
  message?: string;
}

export interface BookingResponse {
  id: number;
  packageId: number;
  packageTitle: string;
  packageDestination: string;
  packageOrigin: string;
  packageStartDate: string;
  packageDurationDays: number;
  packageImage: string | null;
  transportationLabel: string | null;
  transportationIcon: string | null;
  hostId: number;
  hostName: string;
  hostPhoto: string | null;
  hostPhone: string | null;
  hostWhatsapp: string | null;
  passengerId: number;
  passengerName: string;
  passengerPhoto: string | null;
  passengerPhone: string | null;
  passengerWhatsapp: string | null;
  seatsBooked: number;
  message: string | null;
  status: BookingStatus;
  instantBooking: boolean;
  rating: number | null;
  review: string | null;
  ratedAt: string | null;
  createdAt: string;
  respondedAt: string | null;
}

// Package with distance response (from search-nearby API)
export interface PackageWithDistanceResponse {
  packageInfo: TravelPackage;
  distanceFromUserOrigin: number | null;
  originInItinerary: boolean;
}

// UI Helper Types
export interface PoolCategory {
  type: PackageType | VehicleType | 'ALL';
  icon: React.ReactNode;
  label: string;
  color?: string;
}

// Filter Types
export interface TransportationOption {
  value: string;
  label: string;
  icon: string;
}

export interface PriceRange {
  min: number;
  max: number;
  suggestedRanges: PriceRangeOption[];
}

export interface PriceRangeOption {
  label: string;
  min: number;
  max: number;
}

export interface PackageTypeOption {
  value: string;
  label: string;
  icon: string;
}

export interface FilterOptionsResponse {
  transportationOptions: TransportationOption[];
  priceRange: PriceRange;
  durationOptions: number[];
  packageTypes: PackageTypeOption[];
}

export interface PackageFilters {
  minPrice?: number;
  maxPrice?: number;
  days?: number;
  minDays?: number;
  maxDays?: number;
  transportation?: string;
  featured?: boolean;
}
