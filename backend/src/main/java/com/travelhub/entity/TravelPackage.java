package com.travelhub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Min;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.travelhub.enums.Transportation;


@Entity
@Table(name = "travel_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===== BASIC INFO =====
    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @NotNull(message = "User is required")
    @Column(nullable = false)
    private Long userId;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ===== ORIGIN =====
    @NotBlank(message = "Origin name is required")
    @Column(nullable = false)
    private String originName;

    @NotNull(message = "Origin latitude is required")
    @Column(nullable = false)
    private Double originLatitude;

    @NotNull(message = "Origin longitude is required")
    @Column(nullable = false)
    private Double originLongitude;

    // ===== DESTINATION =====
    @NotBlank(message = "Destination name is required")
    @Column(nullable = false)
    private String destinationName;

    @NotNull(message = "Destination latitude is required")
    @Column(nullable = false)
    private Double destinationLatitude;

    @NotNull(message = "Destination longitude is required")
    @Column(nullable = false)
    private Double destinationLongitude;

    // ===== PRICING =====
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than 0")
    @Column(nullable = false)
    private Integer price;

    private Integer discountedPrice;

    // ===== DURATION =====
    @NotNull(message = "Duration (days) is required")
    @Min(value = 1, message = "Duration must be at least 1 day")
    @Column(nullable = false)
    private Integer durationDays;

    @NotNull(message = "Duration (days) is required")
    @Min(value = 0, message = "Duration nights cannot be negative")
    @Column(nullable = false)
    private Integer durationNights;

    // ===== SEATS =====
    @NotNull(message = "Total seats are required")
    @Min(value = 1, message = "Total seats must be at least 1")
    @Column(nullable = false)
    private Integer totalSeats;

    @NotNull(message = "Available seats are required")
    @Min(value = 0, message = "Available seats cannot be negative")
    @Column(nullable = false)
    private Integer availableSeats;

    // ===== DATES =====
    private LocalDate startDate;

    // ===== DETAILS =====
    @Column(columnDefinition = "TEXT")
    private String inclusions;

    @Column(columnDefinition = "TEXT")
    private String exclusions;

    // ===== TRANSPORT =====
    @NotNull(message = "Transportation type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = true) // Temporarily nullable to allow schema migration
    private Transportation transportation;

    // ===== ITINERARY =====
    @ElementCollection
    @CollectionTable(name = "package_itinerary", joinColumns = @JoinColumn(name = "package_id"))
    @Column(name = "itinerary_item")
    private List<String> itinerary;


    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(columnDefinition = "TEXT")
    private String cancellationPolicy;


    // ===== MEDIA (URLs only — stores both image and video URLs) =====
    @ElementCollection
    @CollectionTable(name = "package_media", joinColumns = @JoinColumn(name = "package_id"))
    @Column(name = "media_url")
    private List<String> mediaUrls;


    // ===== META =====
    @Enumerated(EnumType.STRING)
    private PackageStatus status;

    @NotNull(message = "Package type is required")
    @Enumerated(EnumType.STRING)
    private PackageType packageType;

    private Boolean featured;

    // ===== BOOKING MODE =====
    // true = instant booking (auto-confirmed), false = approval required (host approves)
    @Column(nullable = false)
    private Boolean instantBooking;

    // ===== AUDIT =====
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = PackageStatus.ACTIVE;
        if (featured == null) featured = Boolean.FALSE;
        if (instantBooking == null) instantBooking = Boolean.TRUE;
        if (availableSeats == null) availableSeats = totalSeats;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PackageStatus {
        ACTIVE,
        FULL,
        CANCELLED
    }

    public enum PackageType {
        HILLS("Mountains", "🗻"),
        BEACH("Beach", "🌊"),
        CITY("City Tour", "🌆"),
        PILGRIMAGE("Yatra", "🙏"),
        ADVENTURE("Adventure", "🏕️"),
        WILDLIFE("Nature & Wildlife", "🌿"),
        ROAD_TRIP("Road Trip", "🛣️"),
        HONEYMOON("Honeymoon", "💕");

        private final String label;
        private final String icon;

        PackageType(String label, String icon) {
            this.label = label;
            this.icon = icon;
        }

        public String getLabel() { return label; }
        public String getIcon() { return icon; }
    }
}