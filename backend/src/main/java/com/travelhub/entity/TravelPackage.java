package com.travelhub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


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
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ===== ORIGIN =====
    @Column(nullable = false)
    private String originName;

    @Column(nullable = false)
    private Double originLatitude;

    @Column(nullable = false)
    private Double originLongitude;

    // ===== DESTINATION =====
    @Column(nullable = false)
    private String destinationName;

    @Column(nullable = false)
    private Double destinationLatitude;

    @Column(nullable = false)
    private Double destinationLongitude;

    // ===== PRICING =====
    @Column(nullable = false)
    private Integer price;

    private Integer discountedPrice;

    // ===== DURATION =====
    @Column(nullable = false)
    private Integer durationDays;

    private Integer durationNights;

    // ===== SEATS =====
    @Column(nullable = false)
    private Integer totalSeats;

    @Column(nullable = false)
    private Integer availableSeats;

    // ===== DATES =====
    private LocalDate startDate;
    private LocalDate endDate;

    // ===== DETAILS =====
    @Column(columnDefinition = "TEXT")
    private String inclusions;

    @Column(columnDefinition = "TEXT")
    private String exclusions;

    @Column(columnDefinition = "TEXT")
    private String itinerary;

    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(columnDefinition = "TEXT")
    private String cancellationPolicy;

    @Column(columnDefinition = "TEXT")
    private String transportation;

    // ===== MEDIA (URLs only) ===== this need to be verified
    @ElementCollection
    @CollectionTable(name = "package_images", joinColumns = @JoinColumn(name = "package_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;


    // ===== META =====
    @Enumerated(EnumType.STRING)
    private PackageStatus status;

    private Boolean featured;

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
        if (availableSeats == null) availableSeats = totalSeats;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum FeatureType {
        INCLUDED,
        EXCLUDED
    }

    public enum PackageStatus {
        ACTIVE,
        FULL,
        CANCELLED
    }
}