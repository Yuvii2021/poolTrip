package com.travelhub.dto;

import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.TravelPackage.PackageStatus;
import com.travelhub.entity.TravelPackage.PackageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackageResponse {
    private Long id;
    private String title;
    private String description;
    private String destination;
    private String origin;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private Integer durationDays;
    private Integer durationNights;
    private Integer totalSeats;
    private Integer availableSeats;
    private LocalDate startDate;
    private LocalDate endDate;
    private String inclusions;
    private String exclusions;
    private String itinerary;
    private String termsAndConditions;
    private String cancellationPolicy;
    private String coverImage;
    private String images;
    private PackageType packageType;
    private PackageStatus status;
    private Boolean featured;
    private Double rating;
    private Integer reviewCount;
    private LocalDateTime createdAt;
    
    // Agency info
    private Long agencyId;
    private String agencyName;
    private String agencyPhone;
    private String agencyWhatsapp;
    private String agencyLogo;
    
    public static PackageResponse fromEntity(TravelPackage pkg) {
        return PackageResponse.builder()
                .id(pkg.getId())
                .title(pkg.getTitle())
                .description(pkg.getDescription())
                .destination(pkg.getDestination())
                .origin(pkg.getOrigin())
                .price(pkg.getPrice())
                .discountedPrice(pkg.getDiscountedPrice())
                .durationDays(pkg.getDurationDays())
                .durationNights(pkg.getDurationNights())
                .totalSeats(pkg.getTotalSeats())
                .availableSeats(pkg.getAvailableSeats())
                .startDate(pkg.getStartDate())
                .endDate(pkg.getEndDate())
                .inclusions(pkg.getInclusions())
                .exclusions(pkg.getExclusions())
                .itinerary(pkg.getItinerary())
                .termsAndConditions(pkg.getTermsAndConditions())
                .cancellationPolicy(pkg.getCancellationPolicy())
                .coverImage(pkg.getCoverImage())
                .images(pkg.getImages())
                .packageType(pkg.getPackageType())
                .status(pkg.getStatus())
                .featured(pkg.getFeatured())
                .rating(pkg.getRating())
                .reviewCount(pkg.getReviewCount())
                .createdAt(pkg.getCreatedAt())
                .agencyId(pkg.getAgency().getId())
                .agencyName(pkg.getAgency().getAgencyName())
                .agencyPhone(pkg.getAgency().getPhone())
                .agencyWhatsapp(pkg.getAgency().getWhatsappNumber())
                .agencyLogo(pkg.getAgency().getAgencyLogo())
                .build();
    }
}

