package com.travelhub.controller;
import com.travelhub.dto.PackageRequest;
import com.travelhub.dto.PackageResponse;
import com.travelhub.entity.TravelPackage.PackageStatus;
import com.travelhub.entity.TravelPackage.PackageType;
import com.travelhub.enums.Operator;
import com.travelhub.enums.Transportation;
import com.travelhub.enums.requestFilter;
import com.travelhub.service.PackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
@Slf4j
public class PackageController {

    private final PackageService packageService;
    private final double radiusKm = 39.0;
    private final double earthKmPerDegree = 111.0;
    private final double radiusDeg = 0.351;
    private final double maxDistanceSq = 0.124;

    private final void createHashOfFilter(Integer minPrice,
            Integer maxPrice,
            Integer days,
            String transportation,
            Boolean featured,
            HashMap<String,requestFilter>hashMap) {
        // ===== PRICE FILTER =====
        if (minPrice != null || maxPrice != null) {
            int minValue = (minPrice != null) ? minPrice : 0;
            int maxValue = (maxPrice != null) ? maxPrice : Integer.MAX_VALUE;

            requestFilter priceFilter = new requestFilter();
            priceFilter.setField("price");
            priceFilter.setOperator(Operator.BETWEEN);
            priceFilter.setValue(List.of(minValue, maxValue));

            hashMap.put("price", priceFilter);
        }

        // ===== DURATION FILTER =====
        if (days != null) {
            requestFilter durationFilter = new requestFilter();
            durationFilter.setField("durationDays");
            durationFilter.setOperator(Operator.EQ);
            durationFilter.setValue(days);

            hashMap.put("durationDays", durationFilter);
        }

        // ===== TRANSPORTATION FILTER =====
        if (transportation != null && !transportation.isBlank()) {
            try {
                Transportation.valueOf(transportation);
            } catch (IllegalArgumentException ex) {
                log.debug("Invalid transportation type: " + transportation);
            }
            requestFilter transportFilter = new requestFilter();
            transportFilter.setField("transportation");
            transportFilter.setOperator(Operator.EQ);
            transportFilter.setValue(transportation);

            hashMap.put("transportation", transportFilter);
        }

        // ===== FEATURED FILTER =====
        if (featured != null) {
            requestFilter featuredFilter = new requestFilter();
            featuredFilter.setField("featured");
            featuredFilter.setOperator(Operator.EQ);
            featuredFilter.setValue(featured);

            hashMap.put("featured", featuredFilter);
        }
    }

    @GetMapping
    public ResponseEntity<List<PackageResponse>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @GetMapping("/active")
    public ResponseEntity<List<PackageResponse>> getAllActivePackages() {
        return ResponseEntity.ok(packageService.getAllActivePackages());
    }

    @GetMapping("/featured")
    public ResponseEntity<List<PackageResponse>> getFeaturedPackages() {
        return ResponseEntity.ok(packageService.getFeaturedPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackageResponse> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    // @GetMapping("/search")
    // public ResponseEntity<List<PackageResponse>> searchPackages(@RequestParam
    // String query) {
    // return ResponseEntity.ok(packageService.searchPackages(query));
    // }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<PackageResponse>> getPackagesByType(@PathVariable PackageType type) {
        return ResponseEntity.ok(packageService.getPackagesByType(type));
    }

    @GetMapping("/type/{type}/originLat/{originLat}/originLong/{originLong}")
    public ResponseEntity<List<PackageResponse>> getPackagesByTypeAndOrigin(@PathVariable PackageType type,
            @PathVariable Double originLat,
            @PathVariable Double originLong,
            // OPTIONAL FILTERS 👇
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false) String transportation,
            @RequestParam(required = false) Boolean featured) {

        HashMap<String, requestFilter> hashMap = new HashMap<>();
        createHashOfFilter(minPrice, maxPrice, days, transportation, featured, hashMap);

        return ResponseEntity
                .ok(packageService.getPackagesByTypeAndOrigin(type, originLong, originLat, maxDistanceSq, hashMap));
    }

    @GetMapping("/destination/destinationLat/{destinationLat}/destinationLong/{destinationLong}")
    public ResponseEntity<List<PackageResponse>> getPackagesByDestination(@PathVariable Double destinationLat,
            @PathVariable Double destinationLong) {
        return ResponseEntity
                .ok(packageService.getPackagesByDestination(destinationLat, destinationLong, maxDistanceSq));
    }

    @GetMapping("/my-packages")
    public ResponseEntity<List<PackageResponse>> getMyPackages(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(packageService.getAgencyPackages(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<PackageResponse> createPackage(
            @Valid @RequestBody PackageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(packageService.createPackage(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PackageResponse> updatePackage(
            @PathVariable Long id,
            @Valid @RequestBody PackageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(packageService.updatePackage(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePackage(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        packageService.deletePackage(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Package deleted successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PackageResponse> updatePackageStatus(
            @PathVariable Long id,
            @RequestParam PackageStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(packageService.updatePackageStatus(id, status, userDetails.getUsername()));
    }
}
