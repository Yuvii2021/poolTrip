package com.travelhub.controller;

import com.travelhub.dto.PackageRequest;
import com.travelhub.dto.PackageResponse;
import com.travelhub.entity.TravelPackage.PackageStatus;
import com.travelhub.entity.TravelPackage.PackageType;
import com.travelhub.service.PackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class PackageController {
    
    private final PackageService packageService;
    
    @GetMapping
    public ResponseEntity<List<PackageResponse>> getAllPackages() {
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
    
    @GetMapping("/search")
    public ResponseEntity<List<PackageResponse>> searchPackages(@RequestParam String query) {
        return ResponseEntity.ok(packageService.searchPackages(query));
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<PackageResponse>> getPackagesByType(@PathVariable PackageType type) {
        return ResponseEntity.ok(packageService.getPackagesByType(type));
    }
    
    @GetMapping("/destination/{destination}")
    public ResponseEntity<List<PackageResponse>> getPackagesByDestination(@PathVariable String destination) {
        return ResponseEntity.ok(packageService.getPackagesByDestination(destination));
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

