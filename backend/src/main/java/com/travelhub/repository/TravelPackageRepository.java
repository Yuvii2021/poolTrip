package com.travelhub.repository;

import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.TravelPackage.PackageStatus;
import com.travelhub.entity.TravelPackage.PackageType;
import com.travelhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelPackageRepository extends JpaRepository<TravelPackage, Long> {

       List<TravelPackage> findByStatus(PackageStatus status);

       List<TravelPackage> findByFeaturedTrue();

       List<TravelPackage> findByUserId(Long userId);

       @Query("""
                          SELECT p FROM TravelPackage p
                            ORDER BY
                                   CASE p.status
                                     WHEN 'ACTIVE' THEN 1
                                     WHEN 'FULL' THEN 2
                                     WHEN 'CANCELLED' THEN 3
                                   END,
                            p.createdAt DESC
                     """)
       List<TravelPackage> findAllPackages();

       @Query("SELECT p FROM TravelPackage p WHERE p.status = 'ACTIVE' ORDER BY p.createdAt DESC")
       List<TravelPackage> findAllActivePackages();

       @Query("""
                     SELECT p FROM TravelPackage p
                     WHERE p.status = :status
                     ORDER BY p.createdAt DESC
                     """)
       List<TravelPackage> findAllByStatus(@Param("status") PackageStatus status);

       @Query("SELECT p FROM TravelPackage p WHERE p.status = 'ACTIVE' AND p.featured = true ORDER BY p.createdAt DESC")
       List<TravelPackage> findFeaturedActivePackages();

       @Query("SELECT p FROM TravelPackage p WHERE p.title LIKE %:title% ORDER BY p.createdAt DESC")
       List<TravelPackage> findPackagesByTitle(@Param("title") String title);

       @Query("SELECT p FROM TravelPackage p WHERE p.status = 'ACTIVE' AND " +
                     "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                     "LOWER(p.destination) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                     "LOWER(p.destinationName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                     "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
       List<TravelPackage> searchPackages(@Param("query") String query);

       @Query("""
              SELECT p
                     FROM TravelPackage p
                     WHERE p.status = 'ACTIVE'
                     AND (
                            (p.destinationLatitude - :destinationLong) * (p.destinationLatitude - :destinationLong) +
                            (p.destinationLongitude  - :destinationLat)  * (p.destinationLongitude  - :destinationLat)
                            ) < :maxDistanceSq
                     ORDER BY
                            (
                            (p.destinationLatitude - :destinationLong) * (p.destinationLatitude - :destinationLong) +
                            (p.destinationLongitude  - :destinationLat)  * (p.destinationLongitude  - :destinationLat)
                            ) ASC
                     """)
       List<TravelPackage> findByDestinationContaining(
                     @Param("originLong") Double destinationLong,
                     @Param("originLat") Double destinationLat,
                     @Param("maxDistanceSq") Double maxDistanceSq);

       @Query("SELECT p FROM TravelPackage p WHERE p.status = 'ACTIVE' AND p.packageType = :packageType ORDER BY p.createdAt DESC")
       List<TravelPackage> findByPackageTypeActive(@Param("packageType") PackageType packageType);

       @Query("""
                         SELECT p
                         FROM TravelPackage p
                         WHERE p.status = 'ACTIVE'
                           AND p.packageType = :packageType
                           AND (
                                 (p.originLongitude - :originLong) * (p.originLongitude - :originLong) +
                                 (p.originLatitude  - :originLat)  * (p.originLatitude  - :originLat)
                               ) < :maxDistanceSq
                         ORDER BY
                               (
                                 (p.originLongitude - :originLong) * (p.originLongitude - :originLong) +
                                 (p.originLatitude  - :originLat)  * (p.originLatitude  - :originLat)
                               ) ASC
                     """)
       List<TravelPackage> findByPackageTypeActiveWithOrigin(
                     @Param("packageType") PackageType packageType,
                     @Param("originLong") Double originLong,
                     @Param("originLat") Double originLat,
                     @Param("maxDistanceSq") Double maxDistanceSq);

       @Query("SELECT p FROM TravelPackage p WHERE p.status = 'ACTIVE' AND " +
                     "(LOWER(p.origin) LIKE LOWER(CONCAT('%', :origin, '%')) OR " +
                     "LOWER(p.originName) LIKE LOWER(CONCAT('%', :origin, '%'))) AND " +
                     "(LOWER(p.destination) LIKE LOWER(CONCAT('%', :destination, '%')) OR " +
                     "LOWER(p.destinationName) LIKE LOWER(CONCAT('%', :destination, '%'))) " +
                     "ORDER BY p.createdAt DESC")
       List<TravelPackage> findByOriginAndDestination(@Param("origin") String origin,
                     @Param("destination") String destination);
}
