package com.travelhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterOptionsResponse {
    
    /**
     * Available transportation types with their labels and icons
     */
    private List<TransportationOption> transportationOptions;
    
    /**
     * Price range options (min and max from actual data)
     */
    private PriceRange priceRange;
    
    /**
     * Available duration options (in days) from actual packages
     */
    private List<Integer> durationOptions;
    
    /**
     * Available package types
     */
    private List<PackageTypeOption> packageTypes;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransportationOption {
        private String value;
        private String label;
        private String icon;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceRange {
        private Integer min;
        private Integer max;
        private List<PriceRangeOption> suggestedRanges;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceRangeOption {
        private String label;
        private Integer min;
        private Integer max;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackageTypeOption {
        private String value;
        private String label;
        private String icon;
    }
}
