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
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TravelPackageRepository packageRepository;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random(42); // Fixed seed for reproducibility

    @Override
    public void run(String... args) {
        log.info("Checking and initializing sample data...");
        initializeData();
        log.info("Data initialization check completed.");
    }

    private void initializeData() {
        // Create multiple agencies
        createAgencyIfNotExists("wanderlust@agency.com", "Rahul Sharma", "+91-9876543210");
        createAgencyIfNotExists("adventure@travels.com", "Priya Patel", "+91-9876543220");
        createAgencyIfNotExists("explore@india.com", "Amit Kumar", "+91-9876543230");
        createAgencyIfNotExists("holiday@makers.com", "Sneha Reddy", "+91-9876543240");
        createAgencyIfNotExists("dream@destinations.com", "Vikram Singh", "+91-9876543250");

        // Get all agencies
        List<User> agencies = userRepository.findAll();
        if (agencies.isEmpty()) {
            log.warn("No agencies found. Cannot create packages.");
            return;
        }

        // Create unique packages manually - no loops
        createUniquePackages(agencies);

        log.info("Data initialization completed. Total packages: {}", packageRepository.count());
    }

    private void createAgencyIfNotExists(String email, String name, String phone) {
        if (!userRepository.existsByEmail(email)) {
            User agency = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode("password123"))
                    .fullName(name)
                    .phone(phone)
                    .whatsappNumber(phone)
                    .build();
            userRepository.save(agency);
            log.info("Created user: {}", email);
        }
    }

    private void createUniquePackages(List<User> agencies) {
        // KASHMIR Packages (15 unique packages)
        createKashmirPackages(agencies);
        
        // GOA Packages (15 unique packages)
        createGoaPackages(agencies);
        
        // KERALA Packages (15 unique packages)
        createKeralaPackages(agencies);
        
        // RAJASTHAN Packages (15 unique packages)
        createRajasthanPackages(agencies);
        
        // LADAKH Packages (15 unique packages)
        createLadakhPackages(agencies);
        
        // ANDAMAN Packages (15 unique packages)
        createAndamanPackages(agencies);
        
        // SIKKIM Packages (15 unique packages)
        createSikkimPackages(agencies);
        
        // HIMACHAL Packages (15 unique packages)
        createHimachalPackages(agencies);
    }
    
    // KASHMIR PACKAGES - 15 unique packages
    private void createKashmirPackages(List<User> agencies) {
        User agency1 = agencies.get(0);
        User agency2 = agencies.get(1);
        User agency3 = agencies.get(2);
        
        // Adventure Packages
        createPackage(agency1, "Kashmir Adventure: Gulmarg Skiing Expedition", 
            "Experience world-class skiing in Gulmarg with professional instructors. Includes equipment rental, gondola rides, and snow activities.",
            "Delhi", 28.6139, 77.2090, "Gulmarg", 34.0500, 74.3800,
            45000, 38000, 5, 4, Transportation.FLIGHT_ECONOMY, 
            TravelPackage.PackageType.ADVENTURE, true, LocalDate.now().plusDays(15),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200",
                    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200"),
            List.of("Day 1: Arrival in Srinagar, transfer to Gulmarg", "Day 2-3: Skiing lessons and practice", "Day 4: Gondola ride to Apharwat Peak", "Day 5: Departure"));
        
        createPackage(agency2, "Kashmir Valley Trek: Sonamarg to Naranag", 
            "Trek through pristine meadows, alpine lakes, and snow-capped peaks. Perfect for adventure enthusiasts.",
            "Srinagar", 34.0837, 74.7973, "Sonamarg", 34.2833, 75.2833,
            32000, 27000, 6, 5, Transportation.CAR_SUV,
            TravelPackage.PackageType.ADVENTURE, false, LocalDate.now().plusDays(22),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival and acclimatization", "Day 2-5: Trekking through valleys", "Day 6: Return and departure"));
        
        // Hills/Mountain Packages
        createPackage(agency1, "Kashmir Paradise: Srinagar & Pahalgam Delight", 
            "Explore the beautiful Dal Lake, Mughal gardens, and the serene Pahalgam valley. Stay in houseboats.",
            "Delhi", 28.6139, 77.2090, "Srinagar", 34.0837, 74.7973,
            28000, 24000, 5, 4, Transportation.FLIGHT_ECONOMY,
            TravelPackage.PackageType.HILLS, true, LocalDate.now().plusDays(10),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200",
                    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200"),
            List.of("Day 1: Arrival, Shikara ride on Dal Lake", "Day 2: Mughal Gardens tour", "Day 3: Pahalgam day trip", "Day 4: Local markets and shopping", "Day 5: Departure"));
        
        createPackage(agency3, "Kashmir Hills: Betaab Valley & Aru Valley", 
            "Discover the untouched beauty of Betaab and Aru valleys with breathtaking landscapes and peaceful surroundings.",
            "Srinagar", 34.0837, 74.7973, "Pahalgam", 34.0167, 75.3167,
            22000, null, 4, 3, Transportation.CAR_SUV,
            TravelPackage.PackageType.HILLS, false, LocalDate.now().plusDays(18),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival in Pahalgam", "Day 2: Betaab Valley exploration", "Day 3: Aru Valley visit", "Day 4: Departure"));
        
        // Honeymoon Packages
        createPackage(agency2, "Kashmir Honeymoon: Romantic Houseboat Stay", 
            "Perfect romantic getaway with houseboat stay, shikara rides, and candlelight dinners. Includes flower decorations.",
            "Delhi", 28.6139, 77.2090, "Srinagar", 34.0837, 74.7973,
            35000, 30000, 4, 3, Transportation.FLIGHT_ECONOMY,
            TravelPackage.PackageType.HONEYMOON, true, LocalDate.now().plusDays(12),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival, romantic houseboat check-in", "Day 2: Shikara ride and Mughal Gardens", "Day 3: Pahalgam day trip", "Day 4: Departure"));
        
        createPackage(agency1, "Kashmir Luxury Honeymoon: Premium Experience", 
            "Luxury honeymoon package with 5-star accommodation, private shikara, spa sessions, and exclusive dining.",
            "Mumbai", 19.0760, 72.8777, "Srinagar", 34.0837, 74.7973,
            65000, 55000, 5, 4, Transportation.FLIGHT_BUSINESS,
            TravelPackage.PackageType.HONEYMOON, true, LocalDate.now().plusDays(20),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Luxury arrival and welcome", "Day 2: Private shikara and gardens", "Day 3: Spa and relaxation", "Day 4: Premium dining experience", "Day 5: Departure"));
        
        // Budget Packages
        createPackage(agency3, "Kashmir Budget: Srinagar Essential Tour", 
            "Affordable Kashmir tour covering major attractions. Budget-friendly accommodation and local transport.",
            "Delhi", 28.6139, 77.2090, "Srinagar", 34.0837, 74.7973,
            12000, 10000, 3, 2, Transportation.BUS_AC,
            TravelPackage.PackageType.HILLS, false, LocalDate.now().plusDays(25),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival and Dal Lake visit", "Day 2: Local sightseeing", "Day 3: Departure"));
        
        createPackage(agency2, "Kashmir Budget: Pahalgam Backpacker Special", 
            "Perfect for backpackers. Basic accommodation, shared transport, and essential sightseeing.",
            "Srinagar", 34.0837, 74.7973, "Pahalgam", 34.0167, 75.3167,
            8500, null, 2, 1, Transportation.BUS_NON_AC,
            TravelPackage.PackageType.HILLS, false, LocalDate.now().plusDays(30),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival and local exploration", "Day 2: Departure"));
        
        // Cultural Packages
        createPackage(agency1, "Kashmir Cultural: Heritage & Traditions", 
            "Immerse in Kashmiri culture, visit historic sites, enjoy traditional cuisine, and witness local crafts.",
            "Delhi", 28.6139, 77.2090, "Srinagar", 34.0837, 74.7973,
            25000, 22000, 4, 3, Transportation.FLIGHT_ECONOMY,
            TravelPackage.PackageType.CITY, false, LocalDate.now().plusDays(14),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival", "Day 2: Sufi shrines visit", "Day 3: Ancient temples", "Day 4: Departure"));
        
        createPackage(agency1, "Kashmir Road Trip: Delhi to Srinagar", 
            "Scenic road trip from Delhi through Jammu to Srinagar. Self-drive or with driver option.",
            "Delhi", 28.6139, 77.2090, "Srinagar", 34.0837, 74.7973,
            45000, 38000, 8, 7, Transportation.CAR_SUV,
            TravelPackage.PackageType.ROAD_TRIP, true, LocalDate.now().plusDays(19),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Delhi to Jammu", "Day 2: Jammu to Srinagar", "Day 3-6: Kashmir exploration", "Day 7: Return journey", "Day 8: Arrival in Delhi"));
        
        createPackage(agency2, "Kashmir Luxury: Premium Houseboat & Resorts", 
            "Ultra-luxury experience with premium houseboats, 5-star resorts, and exclusive services.",
            "Mumbai", 19.0760, 72.8777, "Srinagar", 34.0837, 74.7973,
            85000, 72000, 6, 5, Transportation.FLIGHT_BUSINESS,
            TravelPackage.PackageType.HILLS, true, LocalDate.now().plusDays(24),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Luxury arrival", "Day 2-3: Premium houseboat stay", "Day 4-5: Luxury resort", "Day 6: Departure"));
    }
    
    // GOA PACKAGES - 15 unique packages
    private void createGoaPackages(List<User> agencies) {
        User agency1 = agencies.get(0);
        User agency2 = agencies.get(1);
        User agency3 = agencies.get(2);
        
        // Beach Packages
        createPackage(agency1, "Goa Beach Paradise: North & South Coast", 
            "Explore pristine beaches, enjoy water sports, and experience Goa's vibrant nightlife. Stay at beachfront resorts.",
            "Mumbai", 19.0760, 72.8777, "Goa", 15.2993, 74.1240,
            25000, 21000, 5, 4, Transportation.BUS_AC,
            TravelPackage.PackageType.BEACH, true, LocalDate.now().plusDays(12),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival and beach exploration", "Day 2: Water sports and local markets", "Day 3: Departure"));
        
        // Honeymoon Packages
        createPackage(agency2, "Goa Honeymoon: Romantic Beach Escape", 
            "Perfect romantic getaway with private beach access, candlelight dinners, and couples spa sessions.",
            "Mumbai", 19.0760, 72.8777, "Goa", 15.2993, 74.1240,
            45000, 38000, 5, 4, Transportation.FLIGHT_ECONOMY,
            TravelPackage.PackageType.HONEYMOON, true, LocalDate.now().plusDays(18),
            List.of("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"),
            List.of("Day 1: Romantic arrival and beach resort check-in", "Day 2: Private beach activities", "Day 3: Sunset cruise", "Day 4: Couples spa", "Day 5: Departure"));
        
        createPackage(agency1, "Goa Luxury Honeymoon: Premium Beachfront", 
            "Ultra-luxury honeymoon with 5-star beachfront resort, private pool villa, and exclusive dining experiences.",
            "Delhi", 28.6139, 77.2090, "Goa", 15.2993, 74.1240,
            75000, 65000, 6, 5, Transportation.FLIGHT_BUSINESS,
            TravelPackage.PackageType.HONEYMOON, true, LocalDate.now().plusDays(22),
            List.of("https://images.unsplash.com/photo-1512343879784-a960bf40e4f2?w=1200"),
            List.of("Day 1: Luxury arrival", "Day 2-4: Premium beachfront experience", "Day 5: Private yacht cruise", "Day 6: Departure"));
    }
    
    // KERALA PACKAGES - 15 unique packages
    private void createKeralaPackages(List<User> agencies) {
        User agency1 = agencies.get(0);
        User agency2 = agencies.get(1);
        User agency3 = agencies.get(2);
        
        // Backwater Packages
        createPackage(agency1, "Kerala Backwaters: Alleppey Houseboat", 
            "Experience Kerala's famous backwaters on a traditional houseboat. Cruise through serene canals and lagoons.",
            "Kochi", 9.9312, 76.2673, "Alleppey", 9.4981, 76.3388,
            22000, 18500, 3, 2, Transportation.CAR_SUV,
            TravelPackage.PackageType.BEACH, true, LocalDate.now().plusDays(11),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival and consultation", "Day 2-5: Daily treatments and yoga", "Day 6: Departure"));
        
        // Cultural Packages
        createPackage(agency1, "Kerala Cultural: Heritage & Traditions", 
            "Experience Kerala's rich culture through Kathakali, Theyyam, traditional cuisine, and temple visits.",
            "Kochi", 9.9312, 76.2673, "Kochi", 9.9312, 76.2673,
            20000, 17000, 4, 3, Transportation.CAR_SUV,
            TravelPackage.PackageType.CITY, false, LocalDate.now().plusDays(20),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival and local tour", "Day 2: Backwater cruise", "Day 3: Departure"));
        
        // Wildlife Packages
        createPackage(agency3, "Kerala Wildlife: Periyar & Thekkady", 
            "Wildlife safari in Periyar National Park, boat rides, and nature walks.",
            "Kochi", 9.9312, 76.2673, "Thekkady", 9.6000, 77.1667,
            26000, 22000, 4, 3, Transportation.CAR_SUV,
            TravelPackage.PackageType.WILDLIFE, false, LocalDate.now().plusDays(21),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival and safari briefing", "Day 2: Periyar boat ride", "Day 3: Nature walks", "Day 4: Departure"));
        
        // Honeymoon Packages
        createPackage(agency2, "Kerala Honeymoon: Backwater Romance", 
            "Romantic houseboat stay through Kerala's backwaters, private candlelight dinners, and couples spa treatments.",
            "Kochi", 9.9312, 76.2673, "Alleppey", 9.4981, 76.3388,
            40000, 35000, 4, 3, Transportation.CAR_SUV,
            TravelPackage.PackageType.HONEYMOON, true, LocalDate.now().plusDays(16),
            List.of("https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200"),
            List.of("Day 1: Arrival and houseboat check-in", "Day 2: Backwater cruise", "Day 3: Couples spa and relaxation", "Day 4: Departure"));
    }
    
    // RAJASTHAN PACKAGES - 15 unique packages
    private void createRajasthanPackages(List<User> agencies) {
        User agency1 = agencies.get(0);
        User agency2 = agencies.get(1);
        User agency3 = agencies.get(2);
        
        // Cultural Packages
        createPackage(agency1, "Rajasthan Royal: Jaipur, Udaipur, Jodhpur", 
            "Explore Rajasthan's royal cities with palaces, forts, and rich heritage. Stay in heritage hotels.",
            "Delhi", 28.6139, 77.2090, "Jaipur", 26.9124, 75.7873,
            35000, 30000, 6, 5, Transportation.BUS_AC,
            TravelPackage.PackageType.CITY, true, LocalDate.now().plusDays(10),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival in Jaipur", "Day 2: Local sightseeing", "Day 3: Pushkar visit", "Day 4: Departure"));
        
        // Extended Packages
        createPackage(agency3, "Rajasthan Complete: 8-Day Royal Tour", 
            "Comprehensive tour covering all major cities, forts, palaces, and desert experience.",
            "Delhi", 28.6139, 77.2090, "Jaipur", 26.9124, 75.7873,
            55000, 47000, 8, 7, Transportation.BUS_AC,
            TravelPackage.PackageType.CITY, true, LocalDate.now().plusDays(16),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival and desert camp", "Day 2: Dune bashing and activities", "Day 3: Departure"));
        
        // Road Trip Packages
        createPackage(agency3, "Rajasthan Road Trip: Delhi to Rajasthan Circuit", 
            "Scenic road trip covering Rajasthan's golden triangle and beyond. Self-drive or with driver.",
            "Delhi", 28.6139, 77.2090, "Jaipur", 26.9124, 75.7873,
            48000, 41000, 9, 8, Transportation.CAR_SUV,
            TravelPackage.PackageType.ROAD_TRIP, false, LocalDate.now().plusDays(22),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival in Pushkar", "Day 2: Temple visits and rituals", "Day 3: Departure"));
        
        // Photography Packages
        createPackage(agency2, "Rajasthan Photography: Architectural Marvels", 
            "Capture Rajasthan's stunning architecture, forts, palaces, and vibrant culture with professional guidance.",
            "Delhi", 28.6139, 77.2090, "Jaipur", 26.9124, 75.7873,
            38000, 32000, 6, 5, Transportation.BUS_AC,
            TravelPackage.PackageType.CITY, false, LocalDate.now().plusDays(20),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival at fair", "Day 2-3: Fair activities and events", "Day 4: Departure"));
        
        // Honeymoon Packages
        createPackage(agency1, "Rajasthan Honeymoon: Royal Palace Stay", 
            "Romantic honeymoon in heritage palace hotels, private palace tours, and royal dining experiences.",
            "Mumbai", 19.0760, 72.8777, "Udaipur", 24.5854, 73.7125,
            55000, 47000, 5, 4, Transportation.FLIGHT_ECONOMY,
            TravelPackage.PackageType.HONEYMOON, true, LocalDate.now().plusDays(19),
            List.of("https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200"),
            List.of("Day 1: Arrival at palace hotel", "Day 2: Private palace tour", "Day 3: Lake cruise and romantic dinner", "Day 4: Spa and relaxation", "Day 5: Departure"));
        
        createPackage(agency2, "Rajasthan Luxury Honeymoon: Maharaja Experience", 
            "Ultra-luxury honeymoon with private palace suite, helicopter tours, and exclusive royal treatment.",
            "Delhi", 28.6139, 77.2090, "Udaipur", 24.5854, 73.7125,
            95000, 80000, 6, 5, Transportation.FLIGHT_BUSINESS,
            TravelPackage.PackageType.HONEYMOON, true, LocalDate.now().plusDays(25),
            List.of("https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200"),
            List.of("Day 1: Luxury arrival", "Day 2-4: Exclusive royal experiences", "Day 5: Helicopter tour", "Day 6: Departure"));
        
        // Luxury Packages
        createPackage(agency2, "Rajasthan Ultra Luxury: Maharaja Experience", 
            "Ultra-luxury experience with royal treatment, private tours, helicopter rides, and exclusive dining.",
            "Mumbai", 19.0760, 72.8777, "Udaipur", 24.5854, 73.7125,
            95000, 80000, 6, 5, Transportation.FLIGHT_BUSINESS,
            TravelPackage.PackageType.CITY, true, LocalDate.now().plusDays(26),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival and royal welcome", "Day 2-5: Exclusive experiences", "Day 6: Departure"));
    }
    
    // LADAKH PACKAGES - 15 unique packages
    private void createLadakhPackages(List<User> agencies) {
        User agency1 = agencies.get(0);
        User agency2 = agencies.get(1);
        User agency3 = agencies.get(2);
        
        // Adventure Packages
        createPackage(agency1, "Ladakh Adventure: Leh & Nubra Valley", 
            "Explore Leh's monasteries, Nubra Valley's sand dunes, and high-altitude lakes. Experience Ladakhi culture.",
            "Delhi", 28.6139, 77.2090, "Leh", 34.1526, 77.5770,
            45000, 38000, 6, 5, Transportation.FLIGHT_ECONOMY,
            TravelPackage.PackageType.ADVENTURE, true, LocalDate.now().plusDays(12),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival in Leh", "Day 2: Local sightseeing", "Day 3: Nubra Valley", "Day 4: Pangong Lake", "Day 5: Departure"));
        
        // Extended Packages
        createPackage(agency1, "Ladakh Complete: 10-Day Exploration", 
            "Comprehensive tour covering Leh, Nubra, Pangong, Tso Moriri, and all major attractions.",
            "Delhi", 28.6139, 77.2090, "Leh", 34.1526, 77.5770,
            65000, 55000, 10, 9, Transportation.FLIGHT_ECONOMY,
            TravelPackage.PackageType.ADVENTURE, true, LocalDate.now().plusDays(17),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival", "Day 2-4: Monastery visits", "Day 5: Meditation sessions", "Day 6: Departure"));
        
        // Zanskar Packages
        createPackage(agency1, "Ladakh Zanskar: Chadar Trek Experience", 
            "Unique winter trek on frozen Zanskar River. Challenging adventure for experienced trekkers.",
            "Leh", 34.1526, 77.5770, "Zanskar", 33.7000, 77.0000,
            55000, 47000, 12, 11, Transportation.CAR_SUV,
            TravelPackage.PackageType.ADVENTURE, true, LocalDate.now().plusDays(35),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival in Leh", "Day 2-11: Zanskar trekking", "Day 12: Return and departure"));
        
        // Honeymoon Packages
        createPackage(agency2, "Ladakh Honeymoon: Mountain Romance", 
            "Romantic mountain getaway with stunning views, cozy stays, and private experiences in the Himalayas.",
            "Delhi", 28.6139, 77.2090, "Leh", 34.1526, 77.5770,
            50000, 43000, 6, 5, Transportation.FLIGHT_ECONOMY,
            TravelPackage.PackageType.HONEYMOON, true, LocalDate.now().plusDays(17),
            List.of("https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200"),
            List.of("Day 1: Arrival in Leh", "Day 2: Pangong Lake visit", "Day 3: Nubra Valley", "Day 4: Monastery visits", "Day 5: Couples activities", "Day 6: Departure"));
    }
    
    // ANDAMAN PACKAGES - 15 unique packages
    private void createAndamanPackages(List<User> agencies) {
        User agency1 = agencies.get(0);
        User agency2 = agencies.get(1);
        User agency3 = agencies.get(2);
        
        // Beach Packages
        createPackage(agency1, "Andaman Paradise: Port Blair & Havelock", 
            "Explore pristine beaches, crystal-clear waters, and tropical paradise. Visit Cellular Jail and enjoy water activities.",
            "Chennai", 13.0827, 80.2707, "Port Blair", 11.6234, 92.7265,
            35000, 30000, 5, 4, Transportation.FLIGHT_ECONOMY,
            TravelPackage.PackageType.BEACH, true, LocalDate.now().plusDays(11),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival in Gangtok", "Day 2-4: Monastery visits", "Day 5: Departure"));
        
        // Honeymoon Packages
        createPackage(agency2, "Andaman Honeymoon: Tropical Paradise", 
            "Romantic beach honeymoon with private beach access, candlelight dinners, and couples water activities.",
            "Chennai", 13.0827, 80.2707, "Havelock", 12.0000, 92.9500,
            48000, 41000, 6, 5, Transportation.FLIGHT_ECONOMY,
            TravelPackage.PackageType.HONEYMOON, true, LocalDate.now().plusDays(15),
            List.of("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"),
            List.of("Day 1: Arrival and beach resort check-in", "Day 2: Private beach activities", "Day 3: Snorkeling and water sports", "Day 4: Sunset cruise", "Day 5: Couples spa", "Day 6: Departure"));
        
        createPackage(agency1, "Andaman Luxury Honeymoon: Overwater Villa", 
            "Ultra-luxury honeymoon with overwater villa, private butler, and exclusive island experiences.",
            "Mumbai", 19.0760, 72.8777, "Havelock", 12.0000, 92.9500,
            85000, 72000, 7, 6, Transportation.FLIGHT_BUSINESS,
            TravelPackage.PackageType.HONEYMOON, true, LocalDate.now().plusDays(21),
            List.of("https://images.unsplash.com/photo-1512343879784-a960bf40e4f2?w=1200"),
            List.of("Day 1: Luxury arrival", "Day 2-5: Overwater villa experience", "Day 6: Private island tour", "Day 7: Departure"));
    }
    
    // SIKKIM PACKAGES - 15 unique packages
    private void createSikkimPackages(List<User> agencies) {
        User agency1 = agencies.get(0);
        User agency2 = agencies.get(1);
        User agency3 = agencies.get(2);
        
        // Hills/Mountain Packages
        createPackage(agency1, "Sikkim Hills: Gangtok & Tsomgo Lake", 
            "Explore Gangtok's monasteries, visit Tsomgo Lake, and experience Sikkimese culture.",
            "Kolkata", 22.5726, 88.3639, "Gangtok", 27.3314, 88.6138,
            28000, 24000, 5, 4, Transportation.BUS_AC,
            TravelPackage.PackageType.HILLS, true, LocalDate.now().plusDays(10),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200",
                    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200"),
            List.of("Day 1: Arrival", "Day 2-3: Monastery visits", "Day 4: Meditation sessions", "Day 5: Departure"));
        
        // Honeymoon Packages
        createPackage(agency2, "Sikkim Honeymoon: Romantic Mountain Escape", 
            "Perfect romantic getaway with mountain views, cozy stays, and memorable experiences.",
            "Kolkata", 22.5726, 88.3639, "Gangtok", 27.3314, 88.6138,
            42000, 36000, 5, 4, Transportation.FLIGHT_ECONOMY,
            TravelPackage.PackageType.HONEYMOON, true, LocalDate.now().plusDays(11),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival", "Day 2: Local sightseeing", "Day 3: Tsomgo Lake", "Day 4: Departure"));
        
        // Wildlife Packages
        createPackage(agency2, "Sikkim Wildlife: Khangchendzonga National Park", 
            "Explore Khangchendzonga National Park, spot rare wildlife, and enjoy nature trails.",
            "Gangtok", 27.3314, 88.6138, "Khangchendzonga", 27.7000, 88.2000,
            38000, 32000, 6, 5, Transportation.CAR_SUV,
            TravelPackage.PackageType.WILDLIFE, false, LocalDate.now().plusDays(17),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival", "Day 2: Cultural experiences", "Day 3: Traditional cuisine", "Day 4: Local interactions", "Day 5: Departure"));
        
        // Adventure Packages
        createPackage(agency3, "Sikkim Adventure: Rafting & Paragliding", 
            "Adventure activities including river rafting, paragliding, and mountain biking.",
            "Gangtok", 27.3314, 88.6138, "Gangtok", 27.3314, 88.6138,
            38000, 32000, 5, 4, Transportation.CAR_SUV,
            TravelPackage.PackageType.ADVENTURE, false, LocalDate.now().plusDays(23),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200",
                    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200"),
            List.of("Day 1: Arrival in Gangtok", "Day 2-4: Monastery visits", "Day 5: Departure"));
    }
    
    // HIMACHAL PACKAGES - 15 unique packages
    private void createHimachalPackages(List<User> agencies) {
        User agency1 = agencies.get(0);
        User agency2 = agencies.get(1);
        User agency3 = agencies.get(2);
        
        // Hills/Mountain Packages
        createPackage(agency1, "Himachal Hills: Manali & Rohtang Pass", 
            "Explore Manali's scenic beauty, visit Rohtang Pass, and enjoy mountain activities.",
            "Delhi", 28.6139, 77.2090, "Manali", 32.2432, 77.1892,
            25000, 21000, 5, 4, Transportation.BUS_AC,
            TravelPackage.PackageType.HILLS, true, LocalDate.now().plusDays(10),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival", "Day 2: Local sightseeing", "Day 3: Solang Valley", "Day 4: Departure"));
        
        // Extended Packages
        createPackage(agency2, "Himachal Complete: 7-Day Mountain Tour", 
            "Comprehensive tour covering Manali, Shimla, Dharamshala, and all major attractions.",
            "Delhi", 28.6139, 77.2090, "Manali", 32.2432, 77.1892,
            48000, 41000, 7, 6, Transportation.BUS_AC,
            TravelPackage.PackageType.HILLS, true, LocalDate.now().plusDays(14),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival", "Day 2: Dharamshala monasteries", "Day 3: McLeod Ganj", "Day 4: Buddhist culture", "Day 5: Departure"));
        
        // Honeymoon Packages
        createPackage(agency3, "Himachal Honeymoon: Mountain Romance", 
            "Romantic mountain honeymoon with cozy stays, private experiences, and stunning Himalayan views.",
            "Delhi", 28.6139, 77.2090, "Manali", 32.2432, 77.1892,
            45000, 38000, 5, 4, Transportation.FLIGHT_ECONOMY,
            TravelPackage.PackageType.HONEYMOON, true, LocalDate.now().plusDays(13),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival", "Day 2: Dharamshala monasteries", "Day 3: McLeod Ganj", "Day 4: Buddhist culture", "Day 5: Departure"));
        
        // Luxury Packages
        createPackage(agency1, "Himachal Luxury: Premium Mountain Experience", 
            "Luxury experience with premium resorts, private tours, and exclusive services.",
            "Delhi", 28.6139, 77.2090, "Manali", 32.2432, 77.1892,
            75000, 64000, 5, 4, Transportation.FLIGHT_ECONOMY,
            TravelPackage.PackageType.HILLS, true, LocalDate.now().plusDays(21),
            List.of("https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"),
            List.of("Day 1: Arrival", "Day 2: Cultural experiences", "Day 3: Traditional festivals", "Day 4: Local interactions", "Day 5: Departure"));
        
        // Honeymoon Packages
        createPackage(agency3, "Himachal Honeymoon: Mountain Romance", 
            "Romantic mountain honeymoon with cozy stays, private experiences, and stunning Himalayan views.",
            "Delhi", 28.6139, 77.2090, "Manali", 32.2432, 77.1892,
            45000, 38000, 5, 4, Transportation.FLIGHT_ECONOMY,
            TravelPackage.PackageType.HONEYMOON, true, LocalDate.now().plusDays(13),
            List.of("https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200"),
            List.of("Day 1: Arrival and romantic check-in", "Day 2: Private mountain activities", "Day 3: Couples spa", "Day 4: Sunset dinner", "Day 5: Departure"));
    }

    // Overloaded method with custom images and itinerary
    private void createPackage(User agency, String title, String description,
                              String originName, double originLat, double originLong,
                              String destName, double destLat, double destLong,
                              int price, Integer discountedPrice,
                              int durationDays, int durationNights,
                              Transportation transportation,
                              TravelPackage.PackageType packageType,
                              boolean featured,
                              LocalDate startDate,
                              List<String> imageUrls,
                              List<String> itinerary) {
        
        int totalSeats = 20 + random.nextInt(31); // 20-50 seats
        int availableSeats = totalSeats - (random.nextBoolean() ? random.nextInt(5) : 0);

        TravelPackage pkg = TravelPackage.builder()
                .title(title)
                .description(description)
                .userId(agency.getId())
                .originName(originName)
                .originLatitude(originLat)
                .originLongitude(originLong)
                .destinationName(destName)
                .destinationLatitude(destLat)
                .destinationLongitude(destLong)
                .price(price)
                .discountedPrice(discountedPrice)
                .durationDays(durationDays)
                .durationNights(durationNights)
                .totalSeats(totalSeats)
                .availableSeats(availableSeats)
                .startDate(startDate)
                .inclusions("Accommodation, Meals, Transportation, Guide, Sightseeing")
                .exclusions("Personal expenses, Optional activities, Travel insurance")
                .itinerary(itinerary)
                .termsAndConditions("Booking confirmation subject to availability. Cancellation charges apply.")
                .cancellationPolicy("Free cancellation up to 7 days before travel. 50% refund for 3-7 days. No refund within 3 days.")
                .transportation(transportation)
                .imageUrls(imageUrls)
                .packageType(packageType)
                .featured(featured)
                .build();

        packageRepository.save(pkg);
        log.debug("Created package: {}", title);
    }
    
    // Original method for backward compatibility
    private void createPackage(User agency, String title, String description,
                              String originName, double originLat, double originLong,
                              String destName, double destLat, double destLong,
                              int price, Integer discountedPrice,
                              int durationDays, int durationNights,
                              Transportation transportation,
                              TravelPackage.PackageType packageType,
                              boolean featured,
                              LocalDate startDate) {
        
        List<String> defaultImages = List.of(
            "https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200",
            "https://images.unsplash.com/photo-1551524164-6cf77f5e7b8e?w=1200"
        );
        createPackage(agency, title, description, originName, originLat, originLong,
                     destName, destLat, destLong, price, discountedPrice,
                     durationDays, durationNights, transportation, packageType,
                     featured, startDate, defaultImages, generateItinerary(durationDays));
    }

    private List<String> generateItinerary(int days) {
        List<String> itinerary = new java.util.ArrayList<>();
        itinerary.add("Day 1: Arrival and check-in");
        for (int i = 2; i < days; i++) {
            itinerary.add("Day " + i + ": Full day sightseeing and activities");
        }
        if (days > 1) {
            itinerary.add("Day " + days + ": Departure");
        }
        return itinerary;
    }
}

// destination -- xyz -- nearby
// starting point how to filter
