package com.travelhub.repository;

import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelPackageRepository extends JpaRepository<TravelPackage, Long> {
    
    List<TravelPackage> findByAgency(User agency);
    
    List<TravelPackage> findByAgencyId(Long agencyId);
    
    List<TravelPackage> findByStatus(TravelPackage.PackageStatus status);
    
    List<TravelPackage> findByPackageType(TravelPackage.PackageType packageType);
    
    List<TravelPackage> findByFeaturedTrue();
    
    @Query("SELECT p FROM TravelPackage p WHERE p.status = 'ACTIVE' ORDER BY p.createdAt DESC")
    List<TravelPackage> findAllActivePackages();
    
    @Query("SELECT p FROM TravelPackage p WHERE p.status = 'ACTIVE' AND p.featured = true ORDER BY p.createdAt DESC")
    List<TravelPackage> findFeaturedActivePackages();
    
    @Query("SELECT p FROM TravelPackage p WHERE p.status = 'ACTIVE' AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.destination) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<TravelPackage> searchPackages(@Param("query") String query);
    
    @Query("SELECT p FROM TravelPackage p WHERE p.status = 'ACTIVE' AND p.packageType = :type ORDER BY p.createdAt DESC")
    List<TravelPackage> findByPackageTypeActive(@Param("type") TravelPackage.PackageType type);
    
    @Query("SELECT p FROM TravelPackage p WHERE p.status = 'ACTIVE' AND LOWER(p.destination) LIKE LOWER(CONCAT('%', :destination, '%'))")
    List<TravelPackage> findByDestinationContaining(@Param("destination") String destination);
}

