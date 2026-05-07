import { BookingStatus, PackageStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/http.js";
import { bookingResponse } from "../domain/mappers.js";

async function hydrateBooking(bookingId: bigint) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError(400, "Booking not found");
  const pkg = await prisma.travelPackage.findUnique({
    where: { id: booking.packageId },
    include: { media: true },
  });
  const passenger = await prisma.user.findUnique({ where: { id: booking.passengerId } });
  const host = pkg ? await prisma.user.findUnique({ where: { id: pkg.userId } }) : null;
  return bookingResponse(booking, pkg, passenger, host);
}

export async function createBooking(phone: string, input: { packageId: number; seats?: number; message?: string }) {
  const passenger = await prisma.user.findUnique({ where: { phone } });
  if (!passenger) throw new ApiError(400, "User not found");
  const pkg = await prisma.travelPackage.findUnique({ where: { id: BigInt(input.packageId) } });
  if (!pkg) throw new ApiError(400, "Package not found");
  if (pkg.userId === passenger.id) throw new ApiError(400, "You cannot book your own trip");

  const existing = await prisma.booking.findFirst({
    where: {
      passengerId: passenger.id,
      packageId: pkg.id,
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
    },
  });
  if (existing) throw new ApiError(400, "You already have an active booking for this trip");

  const seats = input.seats ?? 1;
  if (pkg.availableSeats < seats) {
    throw new ApiError(400, `Not enough seats available. Only ${pkg.availableSeats} left.`);
  }

  const isInstant = pkg.instantBooking ?? true;
  const status = isInstant ? BookingStatus.CONFIRMED : BookingStatus.PENDING;
  const booking = await prisma.booking.create({
    data: {
      passengerId: passenger.id,
      packageId: pkg.id,
      seatsBooked: seats,
      message: input.message ?? null,
      status,
      respondedAt: isInstant ? new Date() : null,
    },
  });

  if (isInstant) {
    const updatedSeats = pkg.availableSeats - seats;
    await prisma.travelPackage.update({
      where: { id: pkg.id },
      data: {
        availableSeats: updatedSeats,
        status: updatedSeats === 0 ? PackageStatus.FULL : pkg.status,
      },
    });
  }

  return hydrateBooking(booking.id);
}

export async function approveBooking(phone: string, bookingId: number) {
  const host = await prisma.user.findUnique({ where: { phone } });
  if (!host) throw new ApiError(400, "User not found");
  const booking = await prisma.booking.findUnique({ where: { id: BigInt(bookingId) } });
  if (!booking) throw new ApiError(400, "Booking not found");
  const pkg = await prisma.travelPackage.findUnique({ where: { id: booking.packageId } });
  if (!pkg) throw new ApiError(400, "Package not found");
  if (pkg.userId !== host.id) throw new ApiError(400, "Only the trip host can approve bookings");
  if (booking.status !== BookingStatus.PENDING) throw new ApiError(400, "This booking is not pending");
  if (pkg.availableSeats < booking.seatsBooked) throw new ApiError(400, "Not enough seats available anymore");

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BookingStatus.CONFIRMED, respondedAt: new Date() },
  });
  const updatedSeats = pkg.availableSeats - booking.seatsBooked;
  await prisma.travelPackage.update({
    where: { id: pkg.id },
    data: {
      availableSeats: updatedSeats,
      status: updatedSeats === 0 ? PackageStatus.FULL : pkg.status,
    },
  });

  return hydrateBooking(booking.id);
}

export async function rejectBooking(phone: string, bookingId: number) {
  const host = await prisma.user.findUnique({ where: { phone } });
  if (!host) throw new ApiError(400, "User not found");
  const booking = await prisma.booking.findUnique({ where: { id: BigInt(bookingId) } });
  if (!booking) throw new ApiError(400, "Booking not found");
  const pkg = await prisma.travelPackage.findUnique({ where: { id: booking.packageId } });
  if (!pkg) throw new ApiError(400, "Package not found");
  if (pkg.userId !== host.id) throw new ApiError(400, "Only the trip host can reject bookings");
  if (booking.status !== BookingStatus.PENDING) throw new ApiError(400, "This booking is not pending");

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BookingStatus.REJECTED, respondedAt: new Date() },
  });
  return hydrateBooking(booking.id);
}

export async function cancelBooking(phone: string, bookingId: number) {
  const passenger = await prisma.user.findUnique({ where: { phone } });
  if (!passenger) throw new ApiError(400, "User not found");
  const booking = await prisma.booking.findUnique({ where: { id: BigInt(bookingId) } });
  if (!booking) throw new ApiError(400, "Booking not found");
  if (booking.passengerId !== passenger.id) throw new ApiError(400, "You can only cancel your own bookings");
  if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REJECTED) {
    throw new ApiError(400, `This booking is already ${booking.status.toLowerCase()}`);
  }

  if (booking.status === BookingStatus.CONFIRMED) {
    const pkg = await prisma.travelPackage.findUnique({ where: { id: booking.packageId } });
    if (pkg) {
      await prisma.travelPackage.update({
        where: { id: pkg.id },
        data: {
          availableSeats: pkg.availableSeats + booking.seatsBooked,
          status: pkg.status === PackageStatus.FULL ? PackageStatus.ACTIVE : pkg.status,
        },
      });
    }
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BookingStatus.CANCELLED },
  });
  return hydrateBooking(booking.id);
}

export async function myBookings(phone: string) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new ApiError(400, "User not found");
  const rows = await prisma.booking.findMany({
    where: { passengerId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(rows.map((b) => hydrateBooking(b.id)));
}

export async function hostBookings(phone: string, pendingOnly = false) {
  const host = await prisma.user.findUnique({ where: { phone } });
  if (!host) throw new ApiError(400, "User not found");
  const hostPackageIds = (
    await prisma.travelPackage.findMany({
      where: { userId: host.id },
      select: { id: true },
    })
  ).map((x) => x.id);
  if (!hostPackageIds.length) return [];
  const rows = await prisma.booking.findMany({
    where: {
      packageId: { in: hostPackageIds },
      ...(pendingOnly ? { status: BookingStatus.PENDING } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(rows.map((b) => hydrateBooking(b.id)));
}

export async function bookingStatus(phone: string, packageId: number) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new ApiError(400, "User not found");
  const existing = await prisma.booking.findFirst({
    where: {
      passengerId: user.id,
      packageId: BigInt(packageId),
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
    },
  });
  if (!existing) return { hasActiveBooking: false };
  return {
    hasActiveBooking: true,
    booking: await hydrateBooking(existing.id),
  };
}

export async function rateBooking(phone: string, bookingId: number, rating: number, review?: string) {
  const passenger = await prisma.user.findUnique({ where: { phone } });
  if (!passenger) throw new ApiError(400, "User not found");
  const booking = await prisma.booking.findUnique({ where: { id: BigInt(bookingId) } });
  if (!booking) throw new ApiError(400, "Booking not found");
  if (booking.passengerId !== passenger.id) throw new ApiError(400, "You can only rate your own bookings");
  if (booking.status !== BookingStatus.CONFIRMED) throw new ApiError(400, "Only confirmed bookings can be rated");
  if (booking.rating !== null) throw new ApiError(400, "You have already rated this booking");

  const pkg = await prisma.travelPackage.findUnique({ where: { id: booking.packageId } });
  if (pkg?.startDate && pkg.startDate > new Date()) {
    throw new ApiError(400, "You can only rate after the trip departure date");
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      rating,
      review: review ?? null,
      ratedAt: new Date(),
    },
  });

  if (pkg) {
    const hostPackageIds = (
      await prisma.travelPackage.findMany({
        where: { userId: pkg.userId },
        select: { id: true },
      })
    ).map((p) => p.id);
    const rated = await prisma.booking.findMany({
      where: {
        packageId: { in: hostPackageIds },
        rating: { not: null },
      },
      select: { rating: true },
    });
    if (rated.length) {
      const avg = rated.reduce((acc, x) => acc + (x.rating ?? 0), 0) / rated.length;
      await prisma.user.update({
        where: { id: pkg.userId },
        data: { rating: Math.round(avg * 10) / 10, reviewCount: rated.length },
      });
    }
  }

  return hydrateBooking(booking.id);
}
