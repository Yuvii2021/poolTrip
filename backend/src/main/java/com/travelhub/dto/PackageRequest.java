package com.travelhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import com.travelhub.entity.TravelPackage.PackageType;
import com.travelhub.enums.Transportation;

@Data
public class PackageRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotBlank(message = "Destination is required")
    private String destination;
    
    private Double destinationLatitude;
    private Double destinationLongitude;
    
    @NotBlank(message = "Origin is required")
    private String origin;
    
    private Double originLatitude;
    private Double originLongitude;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Integer price;
    
    private Integer discountedPrice;
    
    @NotNull(message = "Duration days is required")
    @Positive(message = "Duration must be positive")
    private Integer durationDays;
    
    private Integer durationNights;
    
    @NotNull(message = "Total seats is required")
    @Positive(message = "Total seats must be positive")
    private Integer totalSeats;
    
    private Integer availableSeats;
    
    @NotNull(message = "Start date is required")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @NotNull(message = "packageType is required")
    private PackageType packageType;

    private Transportation transportation;

    // ---- Media handling (images + videos via single field) ----
    // New media files to upload to Cloudinary (accepts both images and videos)
    private MultipartFile[] media;
    // Already-uploaded Cloudinary URLs to retain (used during edit)
    private List<String> existingMediaUrls;
    
    private String vechile;
    
    private String inclusions;
    private String exclusions;
    private List<String> itinerary;
    private String termsAndConditions;
    private String cancellationPolicy;
    
    private Boolean featured;
    
    private Boolean instantBooking;
}
