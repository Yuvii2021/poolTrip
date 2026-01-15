package com.travelhub.service;

import com.travelhub.dto.PackageRequest;
import com.travelhub.dto.PackageResponse;
import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.TravelPackage.PackageStatus;
import com.travelhub.entity.TravelPackage.PackageType;
import com.travelhub.entity.User;
import com.travelhub.repository.TravelPackageRepository;
import com.travelhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageService {
    
    private final TravelPackageRepository packageRepository;
    private final UserRepository userRepository;
    
    public List<PackageResponse> getAllActivePackages() {
        return packageRepository.findAllActivePackages()
                .stream()
                .map(PackageResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<PackageResponse> getFeaturedPackages() {
        return packageRepository.findFeaturedActivePackages()
                .stream()
                .map(PackageResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public PackageResponse getPackageById(Long id) {
        TravelPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        return PackageResponse.fromEntity(pkg);
    }
    
    public List<PackageResponse> searchPackages(String query) {
        return packageRepository.searchPackages(query)
                .stream()
                .map(PackageResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<PackageResponse> getPackagesByType(PackageType type) {
        return packageRepository.findByPackageTypeActive(type)
                .stream()
                .map(PackageResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<PackageResponse> getPackagesByDestination(String destination) {
        return packageRepository.findByDestinationContaining(destination)
                .stream()
                .map(PackageResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<PackageResponse> getAgencyPackages(String agencyEmail) {
        User agency = userRepository.findByEmail(agencyEmail)
                .orElseThrow(() -> new RuntimeException("Agency not found"));
        return packageRepository.findByAgency(agency)
                .stream()
                .map(PackageResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public PackageResponse createPackage(PackageRequest request, String agencyEmail) {
        User agency = userRepository.findByEmail(agencyEmail)
                .orElseThrow(() -> new RuntimeException("Agency not found"));
        
        TravelPackage pkg = TravelPackage.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .destination(request.getDestination())
                .origin(request.getOrigin())
                .price(request.getPrice())
                .discountedPrice(request.getDiscountedPrice())
                .durationDays(request.getDurationDays())
                .durationNights(request.getDurationNights())
                .totalSeats(request.getTotalSeats())
                .availableSeats(request.getAvailableSeats() != null ? request.getAvailableSeats() : request.getTotalSeats())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .inclusions(request.getInclusions())
                .exclusions(request.getExclusions())
                .itinerary(request.getItinerary())
                .termsAndConditions(request.getTermsAndConditions())
                .cancellationPolicy(request.getCancellationPolicy())
                .coverImage(request.getCoverImage())
                .images(request.getImages())
                .packageType(request.getPackageType())
                .featured(request.getFeatured())
                .status(PackageStatus.ACTIVE)
                .agency(agency)
                .build();
        
        TravelPackage saved = packageRepository.save(pkg);
        return PackageResponse.fromEntity(saved);
    }
    
    @Transactional
    public PackageResponse updatePackage(Long id, PackageRequest request, String agencyEmail) {
        TravelPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        
        if (!pkg.getAgency().getEmail().equals(agencyEmail)) {
            throw new RuntimeException("You can only update your own packages");
        }
        
        pkg.setTitle(request.getTitle());
        pkg.setDescription(request.getDescription());
        pkg.setDestination(request.getDestination());
        pkg.setOrigin(request.getOrigin());
        pkg.setPrice(request.getPrice());
        pkg.setDiscountedPrice(request.getDiscountedPrice());
        pkg.setDurationDays(request.getDurationDays());
        pkg.setDurationNights(request.getDurationNights());
        pkg.setTotalSeats(request.getTotalSeats());
        // Keep existing availableSeats if not provided, or adjust if totalSeats changed
        if (request.getAvailableSeats() != null) {
            pkg.setAvailableSeats(request.getAvailableSeats());
        } else if (!pkg.getTotalSeats().equals(request.getTotalSeats())) {
            // If totalSeats changed and availableSeats not provided, adjust proportionally
            pkg.setAvailableSeats(request.getTotalSeats());
        }
        pkg.setStartDate(request.getStartDate());
        pkg.setEndDate(request.getEndDate());
        pkg.setInclusions(request.getInclusions());
        pkg.setExclusions(request.getExclusions());
        pkg.setItinerary(request.getItinerary());
        pkg.setTermsAndConditions(request.getTermsAndConditions());
        pkg.setCancellationPolicy(request.getCancellationPolicy());
        pkg.setCoverImage(request.getCoverImage());
        pkg.setImages(request.getImages());
        pkg.setPackageType(request.getPackageType());
        pkg.setFeatured(request.getFeatured());
        
        TravelPackage updated = packageRepository.save(pkg);
        return PackageResponse.fromEntity(updated);
    }
    
    @Transactional
    public void deletePackage(Long id, String agencyEmail) {
        TravelPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        
        if (!pkg.getAgency().getEmail().equals(agencyEmail)) {
            throw new RuntimeException("You can only delete your own packages");
        }
        
        packageRepository.delete(pkg);
    }
    
    @Transactional
    public PackageResponse updatePackageStatus(Long id, PackageStatus status, String agencyEmail) {
        TravelPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        
        if (!pkg.getAgency().getEmail().equals(agencyEmail)) {
            throw new RuntimeException("You can only update your own packages");
        }
        
        pkg.setStatus(status);
        TravelPackage updated = packageRepository.save(pkg);
        return PackageResponse.fromEntity(updated);
    }
}

