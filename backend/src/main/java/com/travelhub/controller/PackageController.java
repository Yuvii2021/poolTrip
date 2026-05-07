package com.travelhub.controller;
import com.travelhub.dto.PackageRequest;
import com.travelhub.dto.PackageResponse;
import com.travelhub.entity.TravelPackage.PackageStatus;
import com.travelhub.entity.TravelPackage.PackageType;
import com.travelhub.enums.Operator;
import com.travelhub.enums.Transportation;
import com.travelhub.enums.requestFilter;
import com.travelhub.service.FilterOptionsService;
import com.travelhub.service.PackageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
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
    private final FilterOptionsService filterOptionsService;
    private final double radiusKm = 39.0;
    private final double earthKmPerDegree = 111.0;
    private final double radiusDeg = 0.351;
    private final double maxDistanceSq = 0.124;

    private final void createHashOfFilter(Integer minPrice,
            Integer maxPrice,
            Integer days,
            Integer minDays,
            Integer maxDays,
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
        // Support both exact match (days) and range (minDays/maxDays)
        if (minDays != null || maxDays != null) {
            int minDur = (minDays != null) ? minDays : 1;
            int maxDur = (maxDays != null) ? maxDays : Integer.MAX_VALUE;

            requestFilter durationFilter = new requestFilter();
            durationFilter.setField("durationDays");
            durationFilter.setOperator(Operator.BETWEEN);
            durationFilter.setValue(List.of(minDur, maxDur));

            hashMap.put("durationDays", durationFilter);
        } else if (days != null) {
            // Legacy support for exact match
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
    public ResponseEntity<List<PackageResponse>> getAllPackages(
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false) Integer minDays,
            @RequestParam(required = false) Integer maxDays,
            @RequestParam(required = false) String transportation,
            @RequestParam(required = false) Boolean featured) {
        
        HashMap<String, requestFilter> hashMap = new HashMap<>();
        createHashOfFilter(minPrice, maxPrice, days, minDays, maxDays, transportation, featured, hashMap);
        
        if (hashMap.isEmpty()) {
            return ResponseEntity.ok(packageService.getAllPackages());
        } else {
            return ResponseEntity.ok(packageService.getAllPackagesWithFilters(hashMap));
        }
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
    public ResponseEntity<List<PackageResponse>> getPackagesByType(
            @PathVariable PackageType type,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false) Integer minDays,
            @RequestParam(required = false) Integer maxDays,
            @RequestParam(required = false) String transportation,
            @RequestParam(required = false) Boolean featured) {
        
        HashMap<String, requestFilter> hashMap = new HashMap<>();
        createHashOfFilter(minPrice, maxPrice, days, minDays, maxDays, transportation, featured, hashMap);
        
        if (hashMap.isEmpty()) {
            return ResponseEntity.ok(packageService.getPackagesByType(type));
        } else {
            return ResponseEntity.ok(packageService.getPackagesByTypeWithFilters(type, hashMap));
        }
    }

    // TODO: need to add filters for this endpoint
    @GetMapping("/type/{type}/originLat/{originLat}/originLong/{originLong}")
    public ResponseEntity<List<PackageResponse>> getPackagesByTypeAndOrigin(@PathVariable PackageType type,
            @PathVariable Double originLat,
            @PathVariable Double originLong,
            // OPTIONAL FILTERS 👇
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false) Integer minDays,
            @RequestParam(required = false) Integer maxDays,
            @RequestParam(required = false) String transportation,
            @RequestParam(required = false) Boolean featured) {

        HashMap<String, requestFilter> hashMap = new HashMap<>();
        createHashOfFilter(minPrice, maxPrice, days, minDays, maxDays, transportation, featured, hashMap);

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

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PackageResponse>> getPackagesByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(packageService.getPackagesByUserId(userId));
    }

    @GetMapping("/filter-options")
    public ResponseEntity<?> getFilterOptions() {
        return ResponseEntity.ok(filterOptionsService.getFilterOptions());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PackageResponse> createPackage(
            @ModelAttribute PackageRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        // DEBUG: log the raw transportation value from the request
        log.debug("Raw 'transportation' param from request: '{}'", httpRequest.getParameter("transportation"));
        log.debug("Bound PackageRequest.transportation: '{}'", request.getTransportation());
        return ResponseEntity.ok(packageService.createPackage(request, userDetails.getUsername()));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PackageResponse> updatePackage(
            @PathVariable Long id,
            @ModelAttribute PackageRequest request,
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
