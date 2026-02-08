package com.travelhub.dto;

import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.User;
import com.travelhub.enums.Transportation;
import com.travelhub.entity.TravelPackage.PackageStatus;
import com.travelhub.entity.TravelPackage.PackageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackageResponse {
    private Long id;
    private String title;
    private String description;
    private Double originLatitude;
    private Double originLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private Integer price;
    private Integer discountedPrice;
    private Integer durationDays;
    private Integer durationNights;
    private Integer totalSeats;
    private Integer availableSeats;
    private LocalDate startDate;
    private String inclusions;
    private String exclusions;
    private Long userId;
    private List<String> itinerary;
    private String termsAndConditions;
    private String cancellationPolicy;
    private String coverImage;
    private Transportation transportation;
    private String transportationLabel; // Display label from Transportation enum
    private String transportationIcon; // Display icon/emoji from Transportation enum
    private PackageType packageType;
    private String packageTypeLabel; // Display label from PackageType enum
    private String packageTypeIcon; // Display icon/emoji from PackageType enum
    private List<String> images;
    private PackageStatus status;
    private Boolean featured;
    private Double rating;
    private Integer reviewCount;
    private List<String> reviews;
    private LocalDateTime createdAt;
    
    public static PackageResponse fromEntity(TravelPackage pkg, User user) {
        return PackageResponse.builder()
                .id(pkg.getId())
                .title(pkg.getTitle())
                .description(pkg.getDescription())
                .destinationLatitude(pkg.getDestinationLatitude())
                .destinationLongitude(pkg.getDestinationLongitude())
                .originLatitude(pkg.getOriginLatitude())
                .originLongitude(pkg.getOriginLongitude())
                .price(pkg.getPrice())
                .discountedPrice(pkg.getDiscountedPrice())
                .durationDays(pkg.getDurationDays())
                .durationNights(pkg.getDurationNights())
                .totalSeats(pkg.getTotalSeats())
                .availableSeats(pkg.getAvailableSeats())
                .startDate(pkg.getStartDate())
                .inclusions(pkg.getInclusions())
                .exclusions(pkg.getExclusions())
                .itinerary(pkg.getItinerary())
                .termsAndConditions(pkg.getTermsAndConditions())
                .cancellationPolicy(pkg.getCancellationPolicy())
                .images(pkg.getImageUrls())
                .coverImage(pkg.getImageUrls() != null && !pkg.getImageUrls().isEmpty() 
                    ? pkg.getImageUrls().get(0) 
                    : null)
                .status(pkg.getStatus())
                .featured(pkg.getFeatured())
                .transportation(pkg.getTransportation())
                .transportationLabel(pkg.getTransportation() != null ? pkg.getTransportation().getLabel() : null)
                .transportationIcon(pkg.getTransportation() != null ? pkg.getTransportation().getIcon() : null)
                .packageType(pkg.getPackageType())
                .packageTypeLabel(pkg.getPackageType() != null ? pkg.getPackageType().getLabel() : null)
                .packageTypeIcon(pkg.getPackageType() != null ? pkg.getPackageType().getIcon() : null)
                .rating(user.getRating())
                .userId(user.getId())
                .reviewCount(user.getReviewCount())
                .createdAt(pkg.getCreatedAt())
                .build();
    }
}

