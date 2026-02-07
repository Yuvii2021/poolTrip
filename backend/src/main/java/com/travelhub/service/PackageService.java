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

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageService {
    
    private final TravelPackageRepository packageRepository;
    private final UserRepository userRepository;

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
    public List<PackageResponse> getPackagesByTypeAndOrigin(PackageType type, 
        Double originLong, Double originLat, 
        Double maxDistanceSq, HashMap<String, 
        requestFilter> filters) {
        List<TravelPackage> packages = Optional.ofNullable(packageRepository.findByPackageTypeActiveWithOrigin(type, originLong, originLat, maxDistanceSq)).orElse(List.of());
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
                .imageUrls(pkg.getImageUrls())
                .packageType(pkg.getPackageType())
                .status(PackageStatus.ACTIVE)
                .featured(Boolean.TRUE.equals(pkg.getFeatured()))
                .build();

        
        TravelPackage saved = packageRepository.save(pkgRequest);

        userData.setNumberOfTrips(
                Optional.ofNullable(userData.getNumberOfTrips()).orElse(0L) + 1
        );
        userRepository.save(userData);

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

        pkg.setTitle(request.getTitle());
        pkg.setDescription(request.getDescription());
        pkg.setOriginName(request.getOrigin());
        pkg.setOriginLatitude(request.getOriginLatitude());
        pkg.setOriginLongitude(request.getOriginLongitude());
        pkg.setDestinationName(request.getDestination());
        pkg.setDestinationLatitude(request.getDestinationLatitude());
        pkg.setDestinationLongitude(request.getDestinationLongitude());
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
        pkg.setImageUrls(request.getImageUrls());
        pkg.setPackageType(request.getPackageType());
        pkg.setFeatured(request.getFeatured());

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
}