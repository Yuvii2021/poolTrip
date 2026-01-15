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
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String destination;
    
    private String origin;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    private BigDecimal discountedPrice;
    
    @Column(nullable = false)
    private Integer durationDays;
    
    private Integer durationNights;
    
    @Column(nullable = false)
    private Integer totalSeats;
    
    @Column(nullable = false)
    private Integer availableSeats;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    @Column(columnDefinition = "TEXT")
    private String inclusions; // JSON string or comma separated
    
    @Column(columnDefinition = "TEXT")
    private String exclusions;
    
    @Column(columnDefinition = "TEXT")
    private String itinerary; // JSON string
    
    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;
    
    @Column(columnDefinition = "TEXT")
    private String cancellationPolicy;
    
    @Column(columnDefinition = "LONGTEXT")
    private String coverImage; // Can store base64 or URL
    
    @Column(columnDefinition = "LONGTEXT")
    private String images; // JSON array of image URLs or base64
    
    @Enumerated(EnumType.STRING)
    private PackageType packageType;
    
    @Enumerated(EnumType.STRING)
    private PackageStatus status;
    
    private Boolean featured;
    
    private Double rating;
    
    private Integer reviewCount;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "agency_id", nullable = false)
    private User agency;
    
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = PackageStatus.ACTIVE;
        if (featured == null) featured = false;
        if (rating == null) rating = 0.0;
        if (reviewCount == null) reviewCount = 0;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum PackageType {
        ADVENTURE, BEACH, CULTURAL, HONEYMOON, FAMILY, PILGRIMAGE, WILDLIFE, CRUISE, LUXURY, BUDGET
    }
    
    public enum PackageStatus {
        ACTIVE, INACTIVE, SOLDOUT, EXPIRED
    }
}

