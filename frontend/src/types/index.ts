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

export type VehicleType = 'CAR' | 'BUS' | 'MINI_BUS' | 'TEMPO' | 'SUV';

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
  endDate?: string;
  totalSeats: number;
  availableSeats: number;
  packageType: PackageType;
  vehicleType?: VehicleType;
  poolType?: PoolType;
  status: PackageStatus;
  coverImage?: string;
  images?: string[];
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: string[];
  termsAndConditions?: string;
  cancellationPolicy?: string;
  featured: boolean;
  rating?: number;
  reviewCount?: number;
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
  origin?: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  durationDays: number;
  durationNights?: number;
  startDate?: string;
  endDate?: string;
  totalSeats: number;
  packageType: PackageType;
  vehicleType?: VehicleType;
  poolType?: PoolType;
  coverImage?: string;
  images?: string;
  inclusions?: string;
  exclusions?: string;
  itinerary?: string;
  termsAndConditions?: string;
  cancellationPolicy?: string;
  featured?: boolean;
  departureTime?: string;
  pickupPoints?: string;
}

// UI Helper Types
export interface PoolCategory {
  type: PackageType | VehicleType | 'ALL';
  icon: React.ReactNode;
  label: string;
  color?: string;
}
