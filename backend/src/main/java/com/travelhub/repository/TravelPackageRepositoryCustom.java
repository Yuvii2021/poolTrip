package com.travelhub.repository;

import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.TravelPackage.PackageType;
import com.travelhub.enums.requestFilter;

import java.util.HashMap;
import java.util.List;

public interface TravelPackageRepositoryCustom {
    List<TravelPackage> findByPackageTypeActiveWithOriginAndFilters(
            PackageType packageType,
            Double originLong,
            Double originLat,
            Double maxDistanceSq,
            HashMap<String, requestFilter> filters);
    
    List<TravelPackage> findByPackageTypeActiveWithFilters(
            PackageType packageType,
            HashMap<String, requestFilter> filters);
    
    List<TravelPackage> findAllActivePackagesWithFilters(
            HashMap<String, requestFilter> filters);
}
