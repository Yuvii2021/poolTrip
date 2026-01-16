package com.travelhub.repository;

import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.TravelPackage.PackageStatus;
import com.travelhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelPackageRepository extends JpaRepository<TravelPackage, Long> {
    
    List<TravelPackage> findByStatus(TravelPackage.PackageStatus status);
    
    List<TravelPackage> findByFeaturedTrue();
    
    @Query("""
            SELECT p FROM TravelPackage p
            WHERE p.status = :status
            ORDER BY p.createdAt DESC
            """)
    List<TravelPackage> findAllByStatus(@Param("status") PackageStatus status);
    
    @Query("SELECT p FROM TravelPackage p WHERE p.status = 'ACTIVE' AND p.featured = true ORDER BY p.createdAt DESC")
    List<TravelPackage> findFeaturedActivePackages();

    @Query("SELECT p FROM TravelPackage p WHERE p.title like '%title%' ORDER BY p.createdAt DESC and p.status DESC")
    List<TravelPackage> findPackagesByTitle(@Param("title") PackageStatus title);
    
    @Query("SELECT p FROM TravelPackage p WHERE p.status = 'ACTIVE' AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.destination) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<TravelPackage> searchPackages(@Param("query") String query);
    
    @Query("SELECT p FROM TravelPackage p WHERE p.status = 'ACTIVE' AND LOWER(p.destination) LIKE LOWER(CONCAT('%', :destination, '%'))")
    List<TravelPackage> findByDestinationContaining(@Param("destination") String destination);
}

