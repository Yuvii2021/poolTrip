package com.travelhub.controller;

import com.travelhub.dto.BookingRequest;
import com.travelhub.dto.BookingResponse;
import com.travelhub.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * Create a new booking (passenger books seats on a package).
     * If the package has instant booking enabled, the booking is confirmed immediately.
     * Otherwise, the booking goes to PENDING status for the host to approve/reject.
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse response = bookingService.createBooking(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Host approves a pending booking request.
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse response = bookingService.approveBooking(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Host rejects a pending booking request.
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse response = bookingService.rejectBooking(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Passenger cancels their own booking.
     * If the booking was CONFIRMED, the seats are restored.
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse response = bookingService.cancelBooking(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Get the current user's bookings (as a passenger).
     */
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<BookingResponse> bookings = bookingService.getMyBookings(userDetails.getUsername());
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get all bookings for packages hosted by the current user.
     */
    @GetMapping("/host")
    public ResponseEntity<List<BookingResponse>> getHostBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<BookingResponse> bookings = bookingService.getHostBookings(userDetails.getUsername());
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get only pending booking requests for the current host.
     */
    @GetMapping("/host/pending")
    public ResponseEntity<List<BookingResponse>> getPendingHostBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<BookingResponse> bookings = bookingService.getPendingHostBookings(userDetails.getUsername());
        return ResponseEntity.ok(bookings);
    }

    /**
     * Check if the current user has an active (PENDING or CONFIRMED) booking for a package.
     */
    @GetMapping("/status/{packageId}")
    public ResponseEntity<Map<String, Object>> getBookingStatus(
            @PathVariable Long packageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = bookingService.getBookingStatus(packageId, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Rate a completed booking (passenger rates the trip/host).
     * Only allowed for CONFIRMED bookings after the departure date.
     */
    @PostMapping("/{id}/rate")
    public ResponseEntity<BookingResponse> rateBooking(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer rating = (Integer) body.get("rating");
        String review = (String) body.get("review");
        BookingResponse response = bookingService.rateBooking(id, rating, review, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}
