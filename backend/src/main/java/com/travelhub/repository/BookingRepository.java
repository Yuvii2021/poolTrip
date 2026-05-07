package com.travelhub.repository;

import com.travelhub.entity.Booking;
import com.travelhub.entity.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Passenger's bookings (my trips I booked)
    List<Booking> findByPassengerIdOrderByCreatedAtDesc(Long passengerId);

    // All bookings for a specific package (host view)
    List<Booking> findByPackageIdOrderByCreatedAtDesc(Long packageId);

    // Bookings for a package filtered by status
    List<Booking> findByPackageIdAndStatusOrderByCreatedAtDesc(Long packageId, BookingStatus status);

    // All bookings for packages owned by a specific host
    @Query("SELECT b FROM Booking b WHERE b.packageId IN " +
           "(SELECT p.id FROM TravelPackage p WHERE p.userId = :hostId) " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findBookingsForHost(@Param("hostId") Long hostId);

    // Pending bookings for a host (needs action)
    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.packageId IN " +
           "(SELECT p.id FROM TravelPackage p WHERE p.userId = :hostId) " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findPendingBookingsForHost(@Param("hostId") Long hostId);

    // Check if passenger already has an active booking for this package
    @Query("SELECT b FROM Booking b WHERE b.passengerId = :passengerId " +
           "AND b.packageId = :packageId AND b.status IN ('PENDING', 'CONFIRMED')")
    Optional<Booking> findActiveBookingByPassengerAndPackage(
            @Param("passengerId") Long passengerId,
            @Param("packageId") Long packageId);

    // Count confirmed seats for a package
    @Query("SELECT COALESCE(SUM(b.seatsBooked), 0) FROM Booking b " +
           "WHERE b.packageId = :packageId AND b.status = 'CONFIRMED'")
    Integer countConfirmedSeatsForPackage(@Param("packageId") Long packageId);

    // Count pending seats for a package
    @Query("SELECT COALESCE(SUM(b.seatsBooked), 0) FROM Booking b " +
           "WHERE b.packageId = :packageId AND b.status = 'PENDING'")
    Integer countPendingSeatsForPackage(@Param("packageId") Long packageId);
}
