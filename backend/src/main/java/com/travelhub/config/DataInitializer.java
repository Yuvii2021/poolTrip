package com.travelhub.config;

import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.User;
import com.travelhub.enums.Transportation;
import com.travelhub.repository.TravelPackageRepository;
import com.travelhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TravelPackageRepository packageRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Checking and initializing sample data...");
        initializeData();
        log.info("Data initialization check completed.");
    }

    private void initializeData() {
        // Create sample agencies with existence check and default roles
        User agency1 = User.builder()
                .email("wanderlust@agency.com")
                .password(passwordEncoder.encode("password123"))
                .fullName("Rahul Sharma")
                .phone("+91-9876543210")
                .whatsappNumber("+91-9876543210")
                .build();
        userRepository.save(agency1);

        // Package - Rajasthan Heritage
        TravelPackage kashmirPackage = TravelPackage.builder()
                // BASIC INFO
                .title("Kashmir Paradise Tour")
                .description("Experience the beauty of Srinagar, Gulmarg, and Pahalgam")

                // ORIGIN
                .originName("Delhi")
                .originLatitude(28.6139)
                .originLongitude(77.2090)

                // DESTINATION
                .destinationName("Srinagar")
                .destinationLatitude(34.0837)
                .destinationLongitude(74.7973)

                // PRICING
                .price(25000)
                .discountedPrice(21999)

                // DURATION
                .durationDays(6)
                .durationNights(5)

                // SEATS
                .totalSeats(30)
                .availableSeats(30)

                // DATES
                .startDate(LocalDate.of(2026, 3, 15))

                // DETAILS
                .inclusions("Hotel, Breakfast, Transfers, Sightseeing")
                .exclusions("Flights, Personal expenses")
                .itinerary(List.of(
                        "Day 1: Arrival",
                        "Day 2: Gulmarg",
                        "Day 3: Pahalgam"))
                .termsAndConditions("Booking amount is non-refundable")
                .cancellationPolicy("Free cancellation up to 7 days before travel")
                .transportation(Transportation.BIKE)

                // MEDIA
                .imageUrls(List.of(
                        "https://img.com/kashmir1.jpg",
                        "https://img.com/kashmir2.jpg"))

                // META
                .packageType(TravelPackage.PackageType.HILLS)
                .featured(true)
                .build();

        packageRepository.save(kashmirPackage);

        log.info("Created 3 agencies and 8 travel packages");
    }
}

// destination -- xyz -- nearby
// starting point how to filter
