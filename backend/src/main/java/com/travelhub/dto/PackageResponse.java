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
    private String origin;
    private Double originLatitude;
    private Double originLongitude;
    private String destination;
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
    private Transportation transportation;
    private String transportationLabel; // Display label from Transportation enum
    private String transportationIcon; // Display icon/emoji from Transportation enum
    private PackageType packageType;
    private String packageTypeLabel; // Display label from PackageType enum
    private String packageTypeIcon; // Display icon/emoji from PackageType enum
    private List<String> media;
    private PackageStatus status;
    private Boolean featured;
    private Boolean instantBooking;
    private Double rating;
    private Integer reviewCount;
    private List<String> reviews;
    private LocalDateTime createdAt;

    // Poster info (user who created/posted the package)
    private String postedByName;
    private String postedByPhoto;
    private Boolean postedByVerified;
    private Integer postedByVerificationPercent;

    // Contact info
    private String agencyPhone;
    private String agencyWhatsapp;
    
    public static PackageResponse fromEntity(TravelPackage pkg, User user) {
        int verificationPercent = 0;
        if (user != null) {
            int steps = 4;
            int done = 0;
            if (Boolean.TRUE.equals(user.getPhoneVerified())) done++;
            if (Boolean.TRUE.equals(user.getEmailVerified())) done++;
            if (user.getProfilePhoto() != null && !user.getProfilePhoto().isBlank()) done++;
            if (user.getBio() != null && !user.getBio().isBlank()) done++;
            verificationPercent = (int) Math.round((done * 100.0) / steps);
        }

        return PackageResponse.builder()
                .id(pkg.getId())
                .title(pkg.getTitle())
                .description(pkg.getDescription())
                .origin(pkg.getOriginName())
                .originLatitude(pkg.getOriginLatitude())
                .originLongitude(pkg.getOriginLongitude())
                .destination(pkg.getDestinationName())
                .destinationLatitude(pkg.getDestinationLatitude())
                .destinationLongitude(pkg.getDestinationLongitude())
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
                .media(pkg.getMediaUrls())
                .status(pkg.getStatus())
                .featured(pkg.getFeatured())
                .instantBooking(pkg.getInstantBooking())
                .transportation(pkg.getTransportation())
                .transportationLabel(pkg.getTransportation() != null ? pkg.getTransportation().getLabel() : null)
                .transportationIcon(pkg.getTransportation() != null ? pkg.getTransportation().getIcon() : null)
                .packageType(pkg.getPackageType())
                .packageTypeLabel(pkg.getPackageType() != null ? pkg.getPackageType().getLabel() : null)
                .packageTypeIcon(pkg.getPackageType() != null ? pkg.getPackageType().getIcon() : null)
                .rating(user != null ? user.getRating() : null)
                .userId(user != null ? user.getId() : pkg.getUserId())
                .reviewCount(user != null ? user.getReviewCount() : null)
                .createdAt(pkg.getCreatedAt())
                .postedByName(user != null ? user.getFullName() : null)
                .postedByPhoto(user != null ? user.getProfilePhoto() : null)
                .postedByVerificationPercent(verificationPercent)
                .postedByVerified(verificationPercent >= 100)
                .agencyPhone(user != null ? user.getPhone() : null)
                .agencyWhatsapp(user != null ? user.getWhatsappNumber() : null)
                .build();
    }
}

