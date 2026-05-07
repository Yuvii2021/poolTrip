import type { NavigatorScreenParams } from '@react-navigation/native';

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

export type VehicleType =
  | 'CAR' | 'SUV' | 'BUS' | 'MINI_BUS' | 'TEMPO'
  | 'TRAIN' | 'FLIGHT' | 'BIKE' | 'SELF'
  | 'CAR_SUV' | 'BUS_AC' | 'BUS_NON_AC'
  | 'FLIGHT_ECONOMY' | 'FLIGHT_BUSINESS';

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
  packageTypeLabel?: string;
  packageTypeIcon?: string;
  vehicleType?: VehicleType;
  transportation?: string;
  transportationLabel?: string;
  transportationIcon?: string;
  poolType?: PoolType;
  status: PackageStatus;
  media?: string[];
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
  transportation?: string;
  poolType?: PoolType;
  existingMediaUrls?: string[];
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

export interface PackageWithDistanceResponse {
  packageInfo: TravelPackage;
  distanceFromUserOrigin: number | null;
  originInItinerary: boolean;
}

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

// Navigation param types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: { redirect?: string } | undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  BookingsTab: undefined;
  PublishTab: undefined;
  RequestsTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  PackageDetail: { packageId: number };
  UserProfile: { userId: number };
  Destinations: { destination?: string };
  Categories: { category?: string };
};

export type BookingsStackParamList = {
  MyBookings: undefined;
  BookingPackageDetail: { packageId: number };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Dashboard: { initialTab?: 'overview' | 'packages' | 'requests' } | undefined;
  CreatePackage: { packageId?: number };
  PublicUserProfile: { userId: number };
};

export type PublishStackParamList = {
  Dashboard: { initialTab?: 'overview' | 'packages' | 'requests' } | undefined;
  CreatePackage: { packageId?: number };
  PublicUserProfile: { userId: number };
};

export type RequestsStackParamList = {
  Requests: undefined;
  RequestPackageDetail: { packageId: number };
};
