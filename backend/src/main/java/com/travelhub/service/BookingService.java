package com.travelhub.service;

import com.travelhub.dto.BookingRequest;
import com.travelhub.dto.BookingResponse;
import com.travelhub.entity.Booking;
import com.travelhub.entity.Booking.BookingStatus;
import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.User;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.TravelPackageRepository;
import com.travelhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TravelPackageRepository packageRepository;
    private final UserRepository userRepository;

    /**
     * Create a booking — BlaBlaCar style:
     * - Instant booking → immediately CONFIRMED + seats decremented
     * - Approval booking → PENDING until host approves
     */
    @Transactional
    public BookingResponse createBooking(BookingRequest request, String phone) {
        User passenger = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TravelPackage pkg = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException("Package not found"));

        // Can't book your own trip
        if (pkg.getUserId().equals(passenger.getId())) {
            throw new RuntimeException("You cannot book your own trip");
        }

        // Check if already booked
        bookingRepository.findActiveBookingByPassengerAndPackage(passenger.getId(), pkg.getId())
                .ifPresent(b -> {
                    throw new RuntimeException("You already have an active booking for this trip");
                });

        int seats = request.getSeats() != null ? request.getSeats() : 1;

        // Check seat availability
        if (pkg.getAvailableSeats() < seats) {
            throw new RuntimeException("Not enough seats available. Only " + pkg.getAvailableSeats() + " left.");
        }

        // Determine booking status based on package mode
        boolean isInstant = pkg.getInstantBooking() != null && pkg.getInstantBooking();
        BookingStatus status = isInstant ? BookingStatus.CONFIRMED : BookingStatus.PENDING;

        Booking booking = Booking.builder()
                .passengerId(passenger.getId())
                .packageId(pkg.getId())
                .seatsBooked(seats)
                .message(request.getMessage())
                .status(status)
                .build();

        if (isInstant) {
            booking.setRespondedAt(LocalDateTime.now());
            // Decrement seats immediately for instant booking
            pkg.setAvailableSeats(pkg.getAvailableSeats() - seats);
            if (pkg.getAvailableSeats() == 0) {
                pkg.setStatus(TravelPackage.PackageStatus.FULL);
            }
            packageRepository.save(pkg);
        }

        bookingRepository.save(booking);
        return toResponse(booking);
    }

    /**
     * Host approves a pending booking
     */
    @Transactional
    public BookingResponse approveBooking(Long bookingId, String phone) {
        User host = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        TravelPackage pkg = packageRepository.findById(booking.getPackageId())
                .orElseThrow(() -> new RuntimeException("Package not found"));

        // Only the trip owner can approve
        if (!pkg.getUserId().equals(host.getId())) {
            throw new RuntimeException("Only the trip host can approve bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("This booking is not pending");
        }

        // Check seats still available
        if (pkg.getAvailableSeats() < booking.getSeatsBooked()) {
            throw new RuntimeException("Not enough seats available anymore");
        }

        // Approve
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setRespondedAt(LocalDateTime.now());

        // Decrement seats
        pkg.setAvailableSeats(pkg.getAvailableSeats() - booking.getSeatsBooked());
        if (pkg.getAvailableSeats() == 0) {
            pkg.setStatus(TravelPackage.PackageStatus.FULL);
        }

        packageRepository.save(pkg);
        bookingRepository.save(booking);
        return toResponse(booking);
    }

    /**
     * Host rejects a pending booking
     */
    @Transactional
    public BookingResponse rejectBooking(Long bookingId, String phone) {
        User host = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        TravelPackage pkg = packageRepository.findById(booking.getPackageId())
                .orElseThrow(() -> new RuntimeException("Package not found"));

        if (!pkg.getUserId().equals(host.getId())) {
            throw new RuntimeException("Only the trip host can reject bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("This booking is not pending");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRespondedAt(LocalDateTime.now());
        bookingRepository.save(booking);
        return toResponse(booking);
    }

    /**
     * Passenger cancels their own booking
     */
    @Transactional
    public BookingResponse cancelBooking(Long bookingId, String phone) {
        User passenger = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getPassengerId().equals(passenger.getId())) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REJECTED) {
            throw new RuntimeException("This booking is already " + booking.getStatus().name().toLowerCase());
        }

        // If was confirmed, restore seats
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            TravelPackage pkg = packageRepository.findById(booking.getPackageId()).orElse(null);
            if (pkg != null) {
                pkg.setAvailableSeats(pkg.getAvailableSeats() + booking.getSeatsBooked());
                if (pkg.getStatus() == TravelPackage.PackageStatus.FULL) {
                    pkg.setStatus(TravelPackage.PackageStatus.ACTIVE);
                }
                packageRepository.save(pkg);
            }
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        return toResponse(booking);
    }

    /**
     * Get passenger's bookings (my trips)
     */
    public List<BookingResponse> getMyBookings(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByPassengerIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Get all booking requests for trips hosted by this user
     */
    public List<BookingResponse> getHostBookings(String phone) {
        User host = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findBookingsForHost(host.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Get pending booking requests for host
     */
    public List<BookingResponse> getPendingHostBookings(String phone) {
        User host = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findPendingBookingsForHost(host.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Check if a specific user already has an active booking for a package
     */
    public Map<String, Object> getBookingStatus(Long packageId, String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Booking> existing = bookingRepository.findActiveBookingByPassengerAndPackage(user.getId(), packageId);

        Map<String, Object> result = new HashMap<>();
        result.put("hasActiveBooking", existing.isPresent());
        if (existing.isPresent()) {
            result.put("booking", toResponse(existing.get()));
        }
        return result;
    }

    /**
     * Rate a completed booking (passenger rates the host/trip)
     * Only allowed for CONFIRMED bookings after the departure date.
     */
    @Transactional
    public BookingResponse rateBooking(Long bookingId, Integer rating, String review, String phone) {
        User passenger = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getPassengerId().equals(passenger.getId())) {
            throw new RuntimeException("You can only rate your own bookings");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed bookings can be rated");
        }

        if (booking.getRating() != null) {
            throw new RuntimeException("You have already rated this booking");
        }

        // Check departure date has passed
        TravelPackage pkg = packageRepository.findById(booking.getPackageId()).orElse(null);
        if (pkg != null && pkg.getStartDate() != null) {
            if (pkg.getStartDate().isAfter(java.time.LocalDate.now())) {
                throw new RuntimeException("You can only rate after the trip departure date");
            }
        }

        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        booking.setRating(rating);
        booking.setReview(review);
        booking.setRatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // Recalculate host's average rating
        if (pkg != null) {
            User host = userRepository.findById(pkg.getUserId()).orElse(null);
            if (host != null) {
                recalculateHostRating(host);
            }
        }

        return toResponse(booking);
    }

    /**
     * Recalculate a host's average rating from all rated bookings on their packages
     */
    private void recalculateHostRating(User host) {
        List<TravelPackage> hostPackages = packageRepository.findByUserId(host.getId());
        List<Long> packageIds = hostPackages.stream().map(TravelPackage::getId).collect(Collectors.toList());

        if (packageIds.isEmpty()) return;

        List<Booking> ratedBookings = bookingRepository.findAll().stream()
                .filter(b -> packageIds.contains(b.getPackageId()))
                .filter(b -> b.getRating() != null)
                .collect(Collectors.toList());

        if (ratedBookings.isEmpty()) return;

        double avg = ratedBookings.stream()
                .mapToInt(Booking::getRating)
                .average()
                .orElse(0.0);

        host.setRating(Math.round(avg * 10.0) / 10.0); // round to 1 decimal
        host.setReviewCount(ratedBookings.size());
        userRepository.save(host);
    }

    // ===== Helper: convert to response DTO =====
    private BookingResponse toResponse(Booking booking) {
        TravelPackage pkg = packageRepository.findById(booking.getPackageId()).orElse(null);
        User passenger = userRepository.findById(booking.getPassengerId()).orElse(null);
        User host = null;
        if (pkg != null) {
            host = userRepository.findById(pkg.getUserId()).orElse(null);
        }

        BookingResponse.BookingResponseBuilder builder = BookingResponse.builder()
                .id(booking.getId())
                .packageId(booking.getPackageId())
                .seatsBooked(booking.getSeatsBooked())
                .message(booking.getMessage())
                .status(booking.getStatus().name())
                .createdAt(booking.getCreatedAt())
                .respondedAt(booking.getRespondedAt());

        if (pkg != null) {
            builder.packageTitle(pkg.getTitle())
                    .packageDestination(pkg.getDestinationName())
                    .packageOrigin(pkg.getOriginName())
                    .packageStartDate(pkg.getStartDate() != null ? pkg.getStartDate().toString() : null)
                    .packageDurationDays(pkg.getDurationDays())
                    .instantBooking(pkg.getInstantBooking());

            if (pkg.getMediaUrls() != null && !pkg.getMediaUrls().isEmpty()) {
                builder.packageImage(pkg.getMediaUrls().get(0));
            }
            if (pkg.getTransportation() != null) {
                builder.transportationLabel(pkg.getTransportation().getLabel())
                        .transportationIcon(pkg.getTransportation().getIcon());
            }
        }

        if (host != null) {
            builder.hostId(host.getId())
                    .hostName(host.getFullName())
                    .hostPhoto(host.getProfilePhoto())
                    .hostPhone(host.getPhone())
                    .hostWhatsapp(host.getWhatsappNumber());
        }

        if (passenger != null) {
            builder.passengerId(passenger.getId())
                    .passengerName(passenger.getFullName())
                    .passengerPhoto(passenger.getProfilePhoto())
                    .passengerPhone(passenger.getPhone())
                    .passengerWhatsapp(passenger.getWhatsappNumber());
        }

        // Rating fields
        builder.rating(booking.getRating())
                .review(booking.getReview())
                .ratedAt(booking.getRatedAt());

        return builder.build();
    }
}
