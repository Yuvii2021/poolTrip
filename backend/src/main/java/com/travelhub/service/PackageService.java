package com.travelhub.service;

import com.travelhub.dto.PackageRequest;
import com.travelhub.dto.PackageResponse;
import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.TravelPackage.PackageStatus;
import com.travelhub.entity.TravelPackage.PackageType;
import com.travelhub.enums.requestFilter;
import com.travelhub.entity.User;
import com.travelhub.repository.TravelPackageRepository;
import com.travelhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PackageService {
    
    private final TravelPackageRepository packageRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final SubscriberNotificationService subscriberNotificationService;

    private Map<Long, User> userMapByPackages(List<TravelPackage> packages){
        Set<Long> userIds = packages.stream()
                .map(TravelPackage::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<User> users = Optional.ofNullable(userRepository.findByIdIn(userIds))
                .orElse(List.of());

        Map<Long, User> idPerUser = users.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(User::getId, user -> user));

        return idPerUser;
    }

    private User userMapByPackage(TravelPackage pkg) {
        if (pkg == null || pkg.getUserId() == null) return null;
        return userRepository.findById(pkg.getUserId()).orElse(null);
    }

    public List<PackageResponse> getAllPackages() {

        List<TravelPackage> packages = Optional.ofNullable(packageRepository.findAllPackages()).orElse(List.of());
        if (packages.isEmpty()) {
            return List.of();
        }
        Map<Long, User> idPerUser = userMapByPackages(packages);
        return packages.stream()
                .filter(Objects::nonNull)
                .map(pkg -> {
                    User user = idPerUser.get(pkg.getUserId());
                    return PackageResponse.fromEntity(pkg, user);
                })
                .toList();
    }
    
    public List<PackageResponse> getAllPackagesWithFilters(HashMap<String, requestFilter> filters) {
        List<TravelPackage> packages = Optional.ofNullable(
            packageRepository.findAllActivePackagesWithFilters(filters)
        ).orElse(List.of());
        if (packages.isEmpty()) {
            return List.of();
        }
        Map<Long, User> idPerUser = userMapByPackages(packages);
        return packages.stream()
                .filter(Objects::nonNull)
                .map(pkg -> {
                    User user = idPerUser.get(pkg.getUserId());
                    return PackageResponse.fromEntity(pkg, user);
                })
                .toList();
    }

    public List<PackageResponse> getAllActivePackages() {
        List<TravelPackage> packages = packageRepository.findAllActivePackages();
        if (packages.isEmpty()) {
            return List.of();
        }
        Map<Long, User> idPerUser = userMapByPackages(packages);

        return packages.stream()
                .map(pkg -> {
                    User user = idPerUser.get(pkg.getUserId());
                    return PackageResponse.fromEntity(pkg, user);
                })
                .toList();
    }
    
    public List<PackageResponse> getFeaturedPackages() {
        List<TravelPackage> packages = packageRepository.findFeaturedActivePackages();
        if (packages.isEmpty()) {
            return List.of();
        }
        Map<Long, User> idPerUser = userMapByPackages(packages);
        return packages.stream()
                .map(pkg -> {
                    User user = idPerUser.get(pkg.getUserId());
                    return PackageResponse.fromEntity(pkg, user);
                })
                .toList();
    }
    
    public PackageResponse getPackageById(Long id) {
        TravelPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        
        User user = userMapByPackage(pkg);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return PackageResponse.fromEntity(pkg, user);
    }
    
    // public List<PackageResponse> searchPackages(String query) {
    //     return packageRepository.searchPackages(query)
    //             .stream()
    //             .map(PackageResponse::fromEntity)
    //             .collect(Collectors.toList());
    // }
    
    public List<PackageResponse> getPackagesByType(PackageType type) {
        List<TravelPackage> packages = Optional.ofNullable(packageRepository.findByPackageTypeActive(type)).orElse(List.of());
        if (packages.isEmpty()) {
            return List.of();
        }
        Map<Long, User> idPerUser = userMapByPackages(packages);
        return packages.stream()
                .filter(Objects::nonNull)
                .map(pkg -> {
                    User user = idPerUser.get(pkg.getUserId());
                    return PackageResponse.fromEntity(pkg, user);
                })
                .toList();
    }
    
    public List<PackageResponse> getPackagesByTypeWithFilters(PackageType type, HashMap<String, requestFilter> filters) {
        List<TravelPackage> packages = Optional.ofNullable(
            packageRepository.findByPackageTypeActiveWithFilters(type, filters)
        ).orElse(List.of());
        if (packages.isEmpty()) {
            return List.of();
        }
        Map<Long, User> idPerUser = userMapByPackages(packages);
        return packages.stream()
                .filter(Objects::nonNull)
                .map(pkg -> {
                    User user = idPerUser.get(pkg.getUserId());
                    return PackageResponse.fromEntity(pkg, user);
                })
                .toList();
    }
    public List<PackageResponse> getPackagesByTypeAndOrigin(PackageType type, 
        Double originLong, Double originLat, 
        Double maxDistanceSq, HashMap<String, 
        requestFilter> filters) {
        List<TravelPackage> packages = Optional.ofNullable(
            packageRepository.findByPackageTypeActiveWithOriginAndFilters(type, originLong, originLat, maxDistanceSq, filters)
        ).orElse(List.of());
        
        if (packages.isEmpty()) {
            return List.of();
        }
        Map<Long, User> idPerUser = userMapByPackages(packages);
        return packages.stream()
                .filter(Objects::nonNull)
                .map(pkg -> {
                    User user = idPerUser.get(pkg.getUserId());
                    return PackageResponse.fromEntity(pkg, user);
                })
                .toList();
    }
    
    public List<PackageResponse> getPackagesByDestination(Double destinationLong, Double destinationLat, Double maxDistanceSq) {
        List<TravelPackage> packages = Optional.ofNullable(packageRepository.findByDestinationContaining(destinationLong, destinationLat, maxDistanceSq)).orElse(List.of());
        if (packages.isEmpty()) {
            return List.of();
        }
        Map<Long, User> idPerUser = userMapByPackages(packages);
        return packages.stream()
                .filter(Objects::nonNull)
                .map(pkg -> {
                    User user = idPerUser.get(pkg.getUserId());
                    return PackageResponse.fromEntity(pkg, user);
                })
                .toList();
    }
    
    public List<PackageResponse> getPackagesByUserId(Long userId) {
        List<TravelPackage> packages = Optional.ofNullable(packageRepository.findByUserId(userId)).orElse(List.of());
        if (packages.isEmpty()) {
            return List.of();
        }
        Map<Long, User> idPerUser = userMapByPackages(packages);
        return packages.stream()
                .filter(Objects::nonNull)
                .map(pkg -> {
                    User user = idPerUser.get(pkg.getUserId());
                    return PackageResponse.fromEntity(pkg, user);
                })
                .toList();
    }

    public List<PackageResponse> getAgencyPackages(String phone) {
        User userData = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<TravelPackage> packages = Optional.ofNullable(packageRepository.findByUserId(userData.getId())).orElse(List.of());
        if (packages.isEmpty()) {
            return List.of();
        }
        Map<Long, User> idPerUser = userMapByPackages(packages);
        return packages.stream()
                .filter(Objects::nonNull)
                .map(pkg -> {
                    User user = idPerUser.get(pkg.getUserId());
                    return PackageResponse.fromEntity(pkg, user);
                })
                .toList();
    }
    
    @Transactional
    public PackageResponse createPackage(PackageRequest pkg, String phone) {
        User userData = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
        log.info("Creating package for user: {}", userData.getId());
        log.info("Package request: {}", pkg);
        // Upload new media to Cloudinary + keep any existing URLs
        List<String> mediaUrls = buildMediaUrls(pkg, userData.getPhone());

        TravelPackage pkgRequest = TravelPackage.builder()
                .title(pkg.getTitle())
                .description(pkg.getDescription())
                .userId(userData.getId())
                .originName(pkg.getOrigin())
                .originLatitude(pkg.getOriginLatitude())
                .originLongitude(pkg.getOriginLongitude())
                .destinationName(pkg.getDestination())
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
                .transportation(pkg.getTransportation())
                .mediaUrls(mediaUrls)
                .packageType(pkg.getPackageType())
                .status(PackageStatus.ACTIVE)
                .featured(Boolean.TRUE.equals(pkg.getFeatured()))
                .instantBooking(pkg.getInstantBooking() != null ? pkg.getInstantBooking() : Boolean.TRUE)
                .build();

        
        TravelPackage saved = packageRepository.save(pkgRequest);

        userData.setNumberOfTrips(
                Optional.ofNullable(userData.getNumberOfTrips()).orElse(0L) + 1
        );
        userRepository.save(userData);

        // Notify subscribers about the new package (async — won't block response)
        try {
            subscriberNotificationService.notifyNewPackage(saved, userData);
        } catch (Exception e) {
            log.warn("Failed to trigger subscriber notification for package {}: {}", saved.getId(), e.getMessage());
        }

        return PackageResponse.fromEntity(saved, userData);
    }

    @Transactional
    public PackageResponse updatePackage(Long id, PackageRequest request, String phone) {

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TravelPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        if (!pkg.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only update your own packages");
        }

        // Upload new media to Cloudinary + keep any existing URLs
        List<String> mediaUrls = buildMediaUrls(request, user.getPhone());

        pkg.setTitle(request.getTitle());
        pkg.setDescription(request.getDescription());
        pkg.setOriginName(request.getOrigin());
        if (request.getOriginLatitude() != null) {
            pkg.setOriginLatitude(request.getOriginLatitude());
        }
        if (request.getOriginLongitude() != null) {
            pkg.setOriginLongitude(request.getOriginLongitude());
        }
        pkg.setDestinationName(request.getDestination());
        if (request.getDestinationLatitude() != null) {
            pkg.setDestinationLatitude(request.getDestinationLatitude());
        }
        if (request.getDestinationLongitude() != null) {
            pkg.setDestinationLongitude(request.getDestinationLongitude());
        }
        pkg.setPrice(request.getPrice());
        pkg.setDiscountedPrice(request.getDiscountedPrice());
        pkg.setDurationDays(request.getDurationDays());
        pkg.setDurationNights(request.getDurationNights());
        pkg.setTotalSeats(request.getTotalSeats());

        if (request.getAvailableSeats() != null) {
            pkg.setAvailableSeats(request.getAvailableSeats());
        }

        pkg.setStartDate(request.getStartDate());
        pkg.setInclusions(request.getInclusions());
        pkg.setExclusions(request.getExclusions());
        pkg.setItinerary(request.getItinerary());
        pkg.setTermsAndConditions(request.getTermsAndConditions());
        pkg.setCancellationPolicy(request.getCancellationPolicy());
        pkg.setTransportation(request.getTransportation());
        pkg.setMediaUrls(mediaUrls);
        pkg.setPackageType(request.getPackageType());
        pkg.setFeatured(request.getFeatured());
        if (request.getInstantBooking() != null) {
            pkg.setInstantBooking(request.getInstantBooking());
        }

        TravelPackage updated = packageRepository.save(pkg);
        return PackageResponse.fromEntity(updated, user);
    }
    
    @Transactional
    public void deletePackage(Long id, String phone) {

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TravelPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        if (!pkg.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own packages");
        }

        user.setNumberOfTrips(
                Optional.ofNullable(user.getNumberOfTrips()).orElse(0L) - 1
        );
        userRepository.save(user);

        packageRepository.delete(pkg);
    }
    
    @Transactional
    public PackageResponse updatePackageStatus(Long id, PackageStatus status, String phone) {

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TravelPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        if (!pkg.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only update your own packages");
        }

        pkg.setStatus(status);
        pkg.setAvailableSeats(0);
        TravelPackage updated = packageRepository.save(pkg);

        return PackageResponse.fromEntity(updated, user);
    }

    /**
     * Builds the final list of media URLs (images + videos) from the request by:
     * 1. Keeping any existing Cloudinary URLs (request.existingMediaUrls — used during edit)
     * 2. Uploading any new MultipartFile media (request.media) to Cloudinary with auto resource_type
     */
    private List<String> buildMediaUrls(PackageRequest request, String userId) {
        List<String> allUrls = new ArrayList<>();

        // Keep already-uploaded Cloudinary URLs
        if (request.getExistingMediaUrls() != null) {
            allUrls.addAll(request.getExistingMediaUrls());
        }

        // Upload new files (images or videos) to Cloudinary under a user-specific folder
        if (request.getMedia() != null && request.getMedia().length > 0) {
            List<String> uploadedUrls = cloudinaryService.uploadMediaFiles(request.getMedia(), userId + "/packages");
            allUrls.addAll(uploadedUrls);
        }

        return allUrls.isEmpty() ? null : allUrls;
    }
}