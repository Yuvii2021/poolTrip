package com.travelhub.service;

import com.travelhub.dto.FilterOptionsResponse;
import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.TravelPackage.PackageType;
import com.travelhub.enums.Transportation;
import com.travelhub.repository.TravelPackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FilterOptionsService {
    
    private final TravelPackageRepository packageRepository;
    
    public FilterOptionsResponse getFilterOptions() {
        List<TravelPackage> allPackages = packageRepository.findAllActivePackages();
        
        return FilterOptionsResponse.builder()
                .transportationOptions(getTransportationOptions())
                .priceRange(getPriceRange(allPackages))
                .durationOptions(getDurationOptions(allPackages))
                .packageTypes(getPackageTypes())
                .build();
    }
    
    private List<FilterOptionsResponse.TransportationOption> getTransportationOptions() {
        return Arrays.stream(Transportation.values())
                .map(t -> FilterOptionsResponse.TransportationOption.builder()
                        .value(t.name())
                        .label(t.getLabel())
                        .icon(t.getIcon())
                        .build())
                .collect(Collectors.toList());
    }
    
    private FilterOptionsResponse.PriceRange getPriceRange(List<TravelPackage> packages) {
        if (packages.isEmpty()) {
            return FilterOptionsResponse.PriceRange.builder()
                    .min(0)
                    .max(100000)
                    .suggestedRanges(getDefaultPriceRanges())
                    .build();
        }
        
        int minPrice = packages.stream()
                .mapToInt(p -> p.getDiscountedPrice() != null ? p.getDiscountedPrice() : p.getPrice())
                .min()
                .orElse(0);
        
        int maxPrice = packages.stream()
                .mapToInt(p -> p.getDiscountedPrice() != null ? p.getDiscountedPrice() : p.getPrice())
                .max()
                .orElse(100000);
        
        // Ensure min and max are different to allow slider movement
        // If all packages have the same price, create a reasonable range around it
        if (minPrice == maxPrice) {
            int basePrice = minPrice;
            // Create a range of ±20% around the base price, minimum 5000 range
            int range = Math.max(5000, (int)(basePrice * 0.2));
            minPrice = Math.max(0, basePrice - range);
            maxPrice = basePrice + range;
        }
        
        // Create suggested price ranges
        List<FilterOptionsResponse.PriceRangeOption> suggestedRanges = new ArrayList<>();
        int range = maxPrice - minPrice;
        
        if (range > 0) {
            suggestedRanges.add(FilterOptionsResponse.PriceRangeOption.builder()
                    .label("Under ₹" + formatPrice(minPrice + range / 4))
                    .min(minPrice)
                    .max(minPrice + range / 4)
                    .build());
            
            suggestedRanges.add(FilterOptionsResponse.PriceRangeOption.builder()
                    .label("₹" + formatPrice(minPrice + range / 4) + " - ₹" + formatPrice(minPrice + range / 2))
                    .min(minPrice + range / 4)
                    .max(minPrice + range / 2)
                    .build());
            
            suggestedRanges.add(FilterOptionsResponse.PriceRangeOption.builder()
                    .label("₹" + formatPrice(minPrice + range / 2) + " - ₹" + formatPrice(minPrice + (3 * range / 4)))
                    .min(minPrice + range / 2)
                    .max(minPrice + (3 * range / 4))
                    .build());
            
            suggestedRanges.add(FilterOptionsResponse.PriceRangeOption.builder()
                    .label("Above ₹" + formatPrice(minPrice + (3 * range / 4)))
                    .min(minPrice + (3 * range / 4))
                    .max(maxPrice)
                    .build());
        } else {
            suggestedRanges = getDefaultPriceRanges();
        }
        
        return FilterOptionsResponse.PriceRange.builder()
                .min(minPrice)
                .max(maxPrice)
                .suggestedRanges(suggestedRanges)
                .build();
    }
    
    private List<FilterOptionsResponse.PriceRangeOption> getDefaultPriceRanges() {
        return Arrays.asList(
                FilterOptionsResponse.PriceRangeOption.builder()
                        .label("Under ₹5,000")
                        .min(0)
                        .max(5000)
                        .build(),
                FilterOptionsResponse.PriceRangeOption.builder()
                        .label("₹5,000 - ₹10,000")
                        .min(5000)
                        .max(10000)
                        .build(),
                FilterOptionsResponse.PriceRangeOption.builder()
                        .label("₹10,000 - ₹25,000")
                        .min(10000)
                        .max(25000)
                        .build(),
                FilterOptionsResponse.PriceRangeOption.builder()
                        .label("Above ₹25,000")
                        .min(25000)
                        .max(1000000)
                        .build()
        );
    }
    
    private String formatPrice(int price) {
        if (price >= 1000) {
            return String.format("%.1fK", price / 1000.0);
        }
        return String.valueOf(price);
    }
    
    private List<Integer> getDurationOptions(List<TravelPackage> packages) {
        Set<Integer> durations = packages.stream()
                .map(TravelPackage::getDurationDays)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        // Always provide common duration options, merge with existing ones
        Set<Integer> commonOptions = new HashSet<>(Arrays.asList(1, 2, 3, 4, 5, 6, 7, 10, 14, 21, 30));
        durations.addAll(commonOptions);
        
        List<Integer> sortedDurations = new ArrayList<>(durations);
        Collections.sort(sortedDurations);
        
        return sortedDurations;
    }
    
    private List<FilterOptionsResponse.PackageTypeOption> getPackageTypes() {
        return Arrays.stream(PackageType.values())
                .map(pt -> FilterOptionsResponse.PackageTypeOption.builder()
                        .value(pt.name())
                        .label(pt.getLabel())
                        .icon(pt.getIcon())
                        .build())
                .collect(Collectors.toList());
    }
}
