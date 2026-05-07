package com.travelhub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who booked
    @Column(nullable = false)
    private Long passengerId;

    // Which trip
    @Column(nullable = false)
    private Long packageId;

    // How many seats
    @Column(nullable = false)
    private Integer seatsBooked;

    // Optional message from passenger
    @Column(columnDefinition = "TEXT")
    private String message;

    // Rating (1-5) given by passenger after trip
    private Integer rating;

    // Review text from passenger
    @Column(columnDefinition = "TEXT")
    private String review;

    // When the passenger rated
    private LocalDateTime ratedAt;

    // Booking status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    // Audit
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // When the host responded (approved/rejected)
    private LocalDateTime respondedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum BookingStatus {
        PENDING,      // Waiting for host approval (approval mode)
        CONFIRMED,    // Confirmed (instant or approved)
        REJECTED,     // Host rejected the request
        CANCELLED     // Passenger cancelled
    }
}
