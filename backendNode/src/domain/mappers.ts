import type { Booking, PackageStatus, TravelPackage, User } from "@prisma/client";
import { packageTypeMeta, transportationMeta } from "./constants.js";

function bigintToNumber(value: bigint | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

export function userPublic(user: User) {
  return {
    id: Number(user.id),
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    whatsappNumber: user.whatsappNumber ?? "",
    bio: user.bio ?? "",
    profilePhoto: user.profilePhoto,
    phoneVerified: user.phoneVerified ?? true,
    emailVerified: user.emailVerified ?? false,
    rating: user.rating ?? 0,
    reviewCount: user.reviewCount ?? 0,
    numberOfTrips: bigintToNumber(user.numberOfTrips) ?? 0,
  };
}

export function packageResponse(
  pkg: TravelPackage & { media?: { mediaUrl: string }[]; itinerary?: { itineraryItem: string }[] },
  user: User | null,
) {
  const packageType = pkg.packageType ?? "";
  const transportation = pkg.transportation ?? "";
  const verificationSteps = [
    Boolean(user?.phoneVerified),
    Boolean(user?.emailVerified),
    Boolean(user?.profilePhoto),
    Boolean(user?.bio),
  ];
  const verificationPercent = user
    ? Math.round((verificationSteps.filter(Boolean).length * 100) / verificationSteps.length)
    : 0;

  return {
    id: Number(pkg.id),
    title: pkg.title,
    description: pkg.description,
    origin: pkg.originName,
    originLatitude: pkg.originLatitude,
    originLongitude: pkg.originLongitude,
    destination: pkg.destinationName,
    destinationLatitude: pkg.destinationLatitude,
    destinationLongitude: pkg.destinationLongitude,
    price: pkg.price,
    discountedPrice: pkg.discountedPrice,
    durationDays: pkg.durationDays,
    durationNights: pkg.durationNights,
    totalSeats: pkg.totalSeats,
    availableSeats: pkg.availableSeats,
    startDate: pkg.startDate ? pkg.startDate.toISOString().slice(0, 10) : null,
    inclusions: pkg.inclusions,
    exclusions: pkg.exclusions,
    itinerary: pkg.itinerary?.map((x) => x.itineraryItem) ?? [],
    termsAndConditions: pkg.termsAndConditions,
    cancellationPolicy: pkg.cancellationPolicy,
    media: pkg.media?.map((x) => x.mediaUrl) ?? [],
    status: pkg.status,
    featured: pkg.featured,
    instantBooking: pkg.instantBooking,
    transportation,
    transportationLabel: transportationMeta[transportation]?.label ?? null,
    transportationIcon: transportationMeta[transportation]?.icon ?? null,
    packageType,
    packageTypeLabel: packageTypeMeta[packageType]?.label ?? null,
    packageTypeIcon: packageTypeMeta[packageType]?.icon ?? null,
    rating: user?.rating ?? null,
    userId: user ? Number(user.id) : Number(pkg.userId),
    agencyId: user ? Number(user.id) : Number(pkg.userId),
    reviewCount: user?.reviewCount ?? null,
    createdAt: pkg.createdAt.toISOString(),
    postedByName: user?.fullName ?? null,
    postedByPhoto: user?.profilePhoto ?? null,
    postedByVerificationPercent: verificationPercent,
    postedByVerified: verificationPercent >= 100,
    agencyPhone: user?.phone ?? null,
    agencyWhatsapp: user?.whatsappNumber ?? null,
  };
}

export function bookingResponse(
  booking: Booking,
  pkg: (TravelPackage & { media?: { mediaUrl: string }[] }) | null,
  passenger: User | null,
  host: User | null,
) {
  const transportation = pkg?.transportation ?? "";
  return {
    id: Number(booking.id),
    packageId: Number(booking.packageId),
    packageTitle: pkg?.title ?? null,
    packageDestination: pkg?.destinationName ?? null,
    packageOrigin: pkg?.originName ?? null,
    packageStartDate: pkg?.startDate ? pkg.startDate.toISOString().slice(0, 10) : null,
    packageDurationDays: pkg?.durationDays ?? null,
    packageImage: pkg?.media?.[0]?.mediaUrl ?? null,
    transportationLabel: transportationMeta[transportation]?.label ?? null,
    transportationIcon: transportationMeta[transportation]?.icon ?? null,
    hostId: host ? Number(host.id) : null,
    hostName: host?.fullName ?? null,
    hostPhoto: host?.profilePhoto ?? null,
    hostPhone: host?.phone ?? null,
    hostWhatsapp: host?.whatsappNumber ?? null,
    passengerId: passenger ? Number(passenger.id) : null,
    passengerName: passenger?.fullName ?? null,
    passengerPhoto: passenger?.profilePhoto ?? null,
    passengerPhone: passenger?.phone ?? null,
    passengerWhatsapp: passenger?.whatsappNumber ?? null,
    seatsBooked: booking.seatsBooked,
    message: booking.message,
    status: booking.status,
    instantBooking: pkg?.instantBooking ?? true,
    rating: booking.rating,
    review: booking.review,
    ratedAt: booking.ratedAt?.toISOString() ?? null,
    createdAt: booking.createdAt.toISOString(),
    respondedAt: booking.respondedAt?.toISOString() ?? null,
  };
}

export function sortByStatusThenDate(status: PackageStatus, createdAt: Date): [number, number] {
  const statusRank = status === "ACTIVE" ? 1 : status === "FULL" ? 2 : 3;
  return [statusRank, createdAt.getTime()];
}
