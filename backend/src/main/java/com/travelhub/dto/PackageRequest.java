package com.travelhub.dto;

import com.travelhub.entity.TravelPackage.PackageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PackageRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotBlank(message = "Destination is required")
    private String destination;
    
    private String origin;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;
    
    private BigDecimal discountedPrice;
    
    @NotNull(message = "Duration days is required")
    @Positive(message = "Duration must be positive")
    private Integer durationDays;
    
    private Integer durationNights;
    
    @NotNull(message = "Total seats is required")
    @Positive(message = "Total seats must be positive")
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
    private Boolean featured;
}

