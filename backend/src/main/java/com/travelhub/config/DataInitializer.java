package com.travelhub.config;

import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.TravelPackage.PackageStatus;
import com.travelhub.entity.TravelPackage.PackageType;
import com.travelhub.entity.User;
import com.travelhub.entity.User.UserRole;
import com.travelhub.repository.TravelPackageRepository;
import com.travelhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final TravelPackageRepository packageRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Initializing sample data...");
            initializeData();
            log.info("Sample data initialized successfully!");
        }
    }
    
    private void initializeData() {
        // Create sample agencies
        User agency1 = User.builder()
                .email("wanderlust@agency.com")
                .password(passwordEncoder.encode("password123"))
                .fullName("Rahul Sharma")
                .phone("+91-9876543210")
                .role(UserRole.AGENCY)
                .agencyName("Wanderlust Travels")
                .agencyDescription("Premium travel experiences since 2010. Specializing in adventure and luxury tours.")
                .agencyLogo("https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200")
                .whatsappNumber("+91-9876543210")
                .address("123 MG Road")
                .city("Mumbai")
                .build();
        userRepository.save(agency1);
        
        User agency2 = User.builder()
                .email("paradise@tours.com")
                .password(passwordEncoder.encode("password123"))
                .fullName("Priya Patel")
                .phone("+91-9988776655")
                .role(UserRole.AGENCY)
                .agencyName("Paradise Tours & Travels")
                .agencyDescription("Your gateway to paradise destinations. Beach holidays and honeymoon packages.")
                .agencyLogo("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200")
                .whatsappNumber("+91-9988776655")
                .address("456 Marine Drive")
                .city("Goa")
                .build();
        userRepository.save(agency2);
        
        User agency3 = User.builder()
                .email("heritage@india.com")
                .password(passwordEncoder.encode("password123"))
                .fullName("Amit Kumar")
                .phone("+91-9123456789")
                .role(UserRole.AGENCY)
                .agencyName("Heritage India Tours")
                .agencyDescription("Explore the rich cultural heritage of India with our expertly curated tours.")
                .agencyLogo("https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=200")
                .whatsappNumber("+91-9123456789")
                .address("789 Connaught Place")
                .city("Delhi")
                .build();
        userRepository.save(agency3);
        
        // Create a sample regular user
        User user1 = User.builder()
                .email("user@test.com")
                .password(passwordEncoder.encode("password123"))
                .fullName("Test User")
                .phone("+91-9000000000")
                .role(UserRole.USER)
                .build();
        userRepository.save(user1);
        
        // Create sample packages
        
        // Package 1 - Kashmir Adventure
        packageRepository.save(TravelPackage.builder()
                .title("Magical Kashmir Valley Tour")
                .description("Experience the breathtaking beauty of Kashmir with our 7-day adventure package. Visit the famous Dal Lake, Gulmarg, Pahalgam, and Sonamarg. Enjoy shikara rides, cable car experiences, and stunning mountain views.")
                .destination("Kashmir")
                .origin("Delhi")
                .price(new BigDecimal("45000"))
                .discountedPrice(new BigDecimal("39999"))
                .durationDays(7)
                .durationNights(6)
                .totalSeats(30)
                .availableSeats(18)
                .startDate(LocalDate.now().plusDays(15))
                .endDate(LocalDate.now().plusDays(22))
                .inclusions("Accommodation in 4-star hotels,All meals (breakfast, lunch, dinner),Airport transfers,Sightseeing as per itinerary,Shikara ride on Dal Lake,Gondola ride in Gulmarg,Professional tour guide")
                .exclusions("Airfare,Personal expenses,Travel insurance,Tips and gratuities,Any activity not mentioned")
                .itinerary("[{\"day\":1,\"title\":\"Arrival in Srinagar\",\"description\":\"Arrive at Srinagar airport, transfer to houseboat, evening shikara ride\"},{\"day\":2,\"title\":\"Gulmarg Excursion\",\"description\":\"Full day trip to Gulmarg, Gondola ride to Kongdoori\"},{\"day\":3,\"title\":\"Pahalgam\",\"description\":\"Drive to Pahalgam, visit Betaab Valley and Aru Valley\"},{\"day\":4,\"title\":\"Pahalgam Activities\",\"description\":\"Horse riding, river rafting (optional)\"},{\"day\":5,\"title\":\"Sonamarg\",\"description\":\"Day trip to Sonamarg, visit Thajiwas Glacier\"},{\"day\":6,\"title\":\"Srinagar Local\",\"description\":\"Mughal Gardens, local markets, handicraft shopping\"},{\"day\":7,\"title\":\"Departure\",\"description\":\"Transfer to airport for departure\"}]")
                .termsAndConditions("50% advance payment required at booking. Full payment 7 days before departure. ID proof mandatory for all travelers. Children below 5 years free, 5-12 years 50% discount.")
                .cancellationPolicy("Free cancellation up to 15 days before departure. 50% refund for cancellations 7-14 days before. No refund for cancellations within 7 days.")
                .coverImage("https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800")
                .images("[\"https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800\",\"https://images.unsplash.com/photo-1595815771614-ade501b21279?w=800\",\"https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800\"]")
                .packageType(PackageType.ADVENTURE)
                .status(PackageStatus.ACTIVE)
                .featured(true)
                .rating(4.8)
                .reviewCount(124)
                .agency(agency1)
                .build());
        
        // Package 2 - Goa Beach Holiday
        packageRepository.save(TravelPackage.builder()
                .title("Goa Beach Paradise")
                .description("Relax and unwind on the beautiful beaches of Goa. This 5-day package includes stays at premium beach resorts, water sports, nightlife experiences, and visits to historic Portuguese churches.")
                .destination("Goa")
                .origin("Mumbai")
                .price(new BigDecimal("28000"))
                .discountedPrice(new BigDecimal("24999"))
                .durationDays(5)
                .durationNights(4)
                .totalSeats(40)
                .availableSeats(25)
                .startDate(LocalDate.now().plusDays(10))
                .endDate(LocalDate.now().plusDays(15))
                .inclusions("Beach resort accommodation,Daily breakfast and dinner,Airport/railway transfers,North Goa sightseeing,South Goa sightseeing,One water sports session,Cruise dinner (1 night)")
                .exclusions("Flights/train tickets,Lunch,Personal expenses,Additional water sports,Nightclub entry fees")
                .itinerary("[{\"day\":1,\"title\":\"Arrival & Beach Time\",\"description\":\"Arrive in Goa, check into resort, relax at Calangute Beach\"},{\"day\":2,\"title\":\"North Goa Tour\",\"description\":\"Visit Fort Aguada, Anjuna Beach, Vagator, Chapora Fort\"},{\"day\":3,\"title\":\"Water Sports & Cruise\",\"description\":\"Morning water sports at Baga Beach, evening sunset cruise\"},{\"day\":4,\"title\":\"South Goa Tour\",\"description\":\"Visit Old Goa churches, Colva Beach, Palolem Beach\"},{\"day\":5,\"title\":\"Departure\",\"description\":\"Leisure time, souvenir shopping, departure\"}]")
                .termsAndConditions("Booking confirmed after 30% advance. Balance due 5 days before travel. Valid ID required. Minimum age for water sports: 12 years.")
                .cancellationPolicy("Full refund if cancelled 10+ days before. 75% refund for 5-10 days. 50% for 3-5 days. No refund within 3 days.")
                .coverImage("https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800")
                .images("[\"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800\",\"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800\",\"https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800\"]")
                .packageType(PackageType.BEACH)
                .status(PackageStatus.ACTIVE)
                .featured(true)
                .rating(4.6)
                .reviewCount(89)
                .agency(agency2)
                .build());
        
        // Package 3 - Rajasthan Heritage
        packageRepository.save(TravelPackage.builder()
                .title("Royal Rajasthan Heritage Tour")
                .description("Step back in time with our 10-day Rajasthan heritage tour. Explore magnificent forts, opulent palaces, and vibrant markets of Jaipur, Jodhpur, Udaipur, and Jaisalmer.")
                .destination("Rajasthan")
                .origin("Delhi")
                .price(new BigDecimal("55000"))
                .discountedPrice(new BigDecimal("49999"))
                .durationDays(10)
                .durationNights(9)
                .totalSeats(25)
                .availableSeats(12)
                .startDate(LocalDate.now().plusDays(20))
                .endDate(LocalDate.now().plusDays(30))
                .inclusions("Heritage hotel stays,All meals,AC transportation,All monument entry fees,Camel safari in Jaisalmer,Boat ride in Udaipur,Professional guide,Cultural performances")
                .exclusions("Flights,Personal shopping,Camera fees,Tips,Travel insurance")
                .itinerary("[{\"day\":1,\"title\":\"Delhi to Jaipur\",\"description\":\"Drive to Jaipur, evening at leisure\"},{\"day\":2,\"title\":\"Jaipur Sightseeing\",\"description\":\"Amber Fort, City Palace, Hawa Mahal, Jantar Mantar\"},{\"day\":3,\"title\":\"Jaipur to Jodhpur\",\"description\":\"Drive to Jodhpur via Ajmer and Pushkar\"},{\"day\":4,\"title\":\"Jodhpur\",\"description\":\"Mehrangarh Fort, Jaswant Thada, Blue City walk\"},{\"day\":5,\"title\":\"Jodhpur to Jaisalmer\",\"description\":\"Drive to Jaisalmer, Sam Sand Dunes\"},{\"day\":6,\"title\":\"Jaisalmer\",\"description\":\"Golden Fort, Patwon Ki Haveli, camel safari\"},{\"day\":7,\"title\":\"Jaisalmer to Udaipur\",\"description\":\"Long scenic drive to Udaipur\"},{\"day\":8,\"title\":\"Udaipur\",\"description\":\"City Palace, Lake Pichola boat ride, Jagdish Temple\"},{\"day\":9,\"title\":\"Udaipur Leisure\",\"description\":\"Free time for shopping and exploration\"},{\"day\":10,\"title\":\"Departure\",\"description\":\"Transfer to Udaipur airport\"}]")
                .termsAndConditions("40% advance required. Full payment 10 days prior. Comfortable walking shoes recommended. Respect local customs at religious sites.")
                .cancellationPolicy("Full refund 20+ days before. 70% for 10-20 days. 40% for 5-10 days. No refund within 5 days.")
                .coverImage("https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800")
                .images("[\"https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800\",\"https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800\",\"https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800\"]")
                .packageType(PackageType.CULTURAL)
                .status(PackageStatus.ACTIVE)
                .featured(true)
                .rating(4.9)
                .reviewCount(156)
                .agency(agency3)
                .build());
        
        // Package 4 - Kerala Backwaters
        packageRepository.save(TravelPackage.builder()
                .title("Kerala Backwaters & Hills")
                .description("Discover God's Own Country with this 6-day Kerala tour. Experience houseboat stays in Alleppey, tea gardens of Munnar, and beaches of Kovalam.")
                .destination("Kerala")
                .origin("Kochi")
                .price(new BigDecimal("35000"))
                .discountedPrice(new BigDecimal("31999"))
                .durationDays(6)
                .durationNights(5)
                .totalSeats(20)
                .availableSeats(8)
                .startDate(LocalDate.now().plusDays(12))
                .endDate(LocalDate.now().plusDays(18))
                .inclusions("Resort & houseboat stays,All meals on houseboat,Breakfast at resorts,AC vehicle,Kathakali show,Ayurvedic massage (1 session),Spice plantation visit")
                .exclusions("Flights,Lunch and dinner at resorts,Personal expenses,Additional spa treatments")
                .itinerary("[{\"day\":1,\"title\":\"Arrival Kochi\",\"description\":\"Arrive at Kochi, visit Fort Kochi, Chinese fishing nets\"},{\"day\":2,\"title\":\"Kochi to Munnar\",\"description\":\"Scenic drive to Munnar, tea garden visit\"},{\"day\":3,\"title\":\"Munnar\",\"description\":\"Eravikulam National Park, Tea Museum, Mattupetty Dam\"},{\"day\":4,\"title\":\"Munnar to Alleppey\",\"description\":\"Drive to Alleppey, board houseboat for backwater cruise\"},{\"day\":5,\"title\":\"Alleppey to Kovalam\",\"description\":\"Drive to Kovalam beach, evening at leisure\"},{\"day\":6,\"title\":\"Departure\",\"description\":\"Beach time, transfer to Trivandrum airport\"}]")
                .termsAndConditions("35% advance booking amount. Houseboat subject to availability. Monsoon season may affect itinerary.")
                .cancellationPolicy("80% refund if cancelled 14+ days before. 50% for 7-14 days. No refund within 7 days.")
                .coverImage("https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800")
                .images("[\"https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800\",\"https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=800\",\"https://images.unsplash.com/photo-1609340767917-e9af8f5a3c9e?w=800\"]")
                .packageType(PackageType.HONEYMOON)
                .status(PackageStatus.ACTIVE)
                .featured(false)
                .rating(4.7)
                .reviewCount(78)
                .agency(agency2)
                .build());
        
        // Package 5 - Ladakh Adventure
        packageRepository.save(TravelPackage.builder()
                .title("Leh Ladakh Bike Expedition")
                .description("The ultimate adventure awaits! Join our 9-day Leh Ladakh bike expedition covering Khardung La, Pangong Lake, Nubra Valley, and more.")
                .destination("Ladakh")
                .origin("Manali")
                .price(new BigDecimal("52000"))
                .discountedPrice(new BigDecimal("47999"))
                .durationDays(9)
                .durationNights(8)
                .totalSeats(15)
                .availableSeats(6)
                .startDate(LocalDate.now().plusDays(25))
                .endDate(LocalDate.now().plusDays(34))
                .inclusions("Royal Enfield bike with fuel,Accommodation (hotels & camps),All meals,Backup vehicle,Mechanic support,Oxygen cylinders,Permits and entry fees,First aid kit")
                .exclusions("Personal riding gear,Travel insurance (mandatory),Alcoholic beverages,Bike damage charges,Medical expenses")
                .itinerary("[{\"day\":1,\"title\":\"Manali\",\"description\":\"Arrive Manali, bike allocation, briefing session\"},{\"day\":2,\"title\":\"Manali to Jispa\",\"description\":\"Ride through Rohtang Pass to Jispa\"},{\"day\":3,\"title\":\"Jispa to Leh\",\"description\":\"Cross Baralacha La, Nakee La, reach Leh\"},{\"day\":4,\"title\":\"Leh Acclimatization\",\"description\":\"Rest day, visit Shanti Stupa, Leh Palace\"},{\"day\":5,\"title\":\"Khardung La\",\"description\":\"Ride to world's highest motorable road\"},{\"day\":6,\"title\":\"Nubra Valley\",\"description\":\"Ride to Nubra, Diskit Monastery, sand dunes\"},{\"day\":7,\"title\":\"Pangong Lake\",\"description\":\"Ride to the stunning Pangong Lake\"},{\"day\":8,\"title\":\"Pangong to Leh\",\"description\":\"Return to Leh via Chang La\"},{\"day\":9,\"title\":\"Departure\",\"description\":\"Fly out from Leh airport\"}]")
                .termsAndConditions("Valid driving license mandatory. Age 21-55 years. Medical fitness certificate required. Must sign liability waiver.")
                .cancellationPolicy("70% refund 30+ days before. 50% for 15-30 days. 25% for 7-15 days. No refund within 7 days.")
                .coverImage("https://images.unsplash.com/photo-1626015365107-36a02251e8f2?w=800")
                .images("[\"https://images.unsplash.com/photo-1626015365107-36a02251e8f2?w=800\",\"https://images.unsplash.com/photo-1589308454676-22c0457f15e0?w=800\",\"https://images.unsplash.com/photo-1606210122158-eeb10e0823bf?w=800\"]")
                .packageType(PackageType.ADVENTURE)
                .status(PackageStatus.ACTIVE)
                .featured(true)
                .rating(4.9)
                .reviewCount(203)
                .agency(agency1)
                .build());
        
        // Package 6 - Andaman Beach
        packageRepository.save(TravelPackage.builder()
                .title("Andaman Islands Escape")
                .description("Escape to the pristine beaches of Andaman. Explore Havelock Island, Neil Island, and enjoy world-class snorkeling and scuba diving.")
                .destination("Andaman")
                .origin("Port Blair")
                .price(new BigDecimal("42000"))
                .discountedPrice(new BigDecimal("38500"))
                .durationDays(6)
                .durationNights(5)
                .totalSeats(24)
                .availableSeats(15)
                .startDate(LocalDate.now().plusDays(18))
                .endDate(LocalDate.now().plusDays(24))
                .inclusions("Beach resort stays,All ferry transfers,Daily breakfast,Snorkeling at Elephant Beach,Glass bottom boat ride,Cellular Jail light show,Port Blair sightseeing")
                .exclusions("Flights to Port Blair,Scuba diving,Lunch and dinner,Water sports activities,Personal expenses")
                .itinerary("[{\"day\":1,\"title\":\"Port Blair\",\"description\":\"Arrive Port Blair, Cellular Jail visit, light show\"},{\"day\":2,\"title\":\"Havelock Island\",\"description\":\"Ferry to Havelock, Radhanagar Beach sunset\"},{\"day\":3,\"title\":\"Havelock\",\"description\":\"Elephant Beach snorkeling, Kalapathar Beach\"},{\"day\":4,\"title\":\"Neil Island\",\"description\":\"Ferry to Neil, visit Bharatpur and Laxmanpur beaches\"},{\"day\":5,\"title\":\"Back to Port Blair\",\"description\":\"Return to Port Blair, Ross Island, North Bay\"},{\"day\":6,\"title\":\"Departure\",\"description\":\"Transfer to airport for departure\"}]")
                .termsAndConditions("40% advance required. Ferry timings subject to weather. Swimming skills recommended for water activities.")
                .cancellationPolicy("Full refund 21+ days before. 60% for 14-21 days. 30% for 7-14 days. No refund within 7 days.")
                .coverImage("https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800")
                .images("[\"https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800\",\"https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800\",\"https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800\"]")
                .packageType(PackageType.BEACH)
                .status(PackageStatus.ACTIVE)
                .featured(false)
                .rating(4.5)
                .reviewCount(67)
                .agency(agency2)
                .build());
        
        // Package 7 - Varanasi Spiritual
        packageRepository.save(TravelPackage.builder()
                .title("Spiritual Varanasi & Bodh Gaya")
                .description("Embark on a spiritual journey to the holy cities of Varanasi and Bodh Gaya. Witness the Ganga Aarti, explore ancient temples, and meditate at Buddhist sites.")
                .destination("Varanasi")
                .origin("Delhi")
                .price(new BigDecimal("22000"))
                .discountedPrice(new BigDecimal("19999"))
                .durationDays(5)
                .durationNights(4)
                .totalSeats(35)
                .availableSeats(22)
                .startDate(LocalDate.now().plusDays(8))
                .endDate(LocalDate.now().plusDays(13))
                .inclusions("Heritage hotel stays,Daily breakfast,Train tickets (AC 3-tier),All transfers,Boat ride for Ganga Aarti,Temple visits,Guide services")
                .exclusions("Flights,Lunch and dinner,Pooja offerings,Personal expenses,Camera fees")
                .itinerary("[{\"day\":1,\"title\":\"Delhi to Varanasi\",\"description\":\"Overnight train to Varanasi\"},{\"day\":2,\"title\":\"Varanasi\",\"description\":\"Morning boat ride, Kashi Vishwanath, evening Ganga Aarti\"},{\"day\":3,\"title\":\"Varanasi Temples\",\"description\":\"Sarnath, Durga Temple, Sankat Mochan\"},{\"day\":4,\"title\":\"Bodh Gaya\",\"description\":\"Day trip to Bodh Gaya, Mahabodhi Temple\"},{\"day\":5,\"title\":\"Departure\",\"description\":\"Morning aarti, transfer to station/airport\"}]")
                .termsAndConditions("Modest dress code required at religious sites. Shoes to be removed at temples. Photography restricted at some locations.")
                .cancellationPolicy("75% refund 10+ days before. 50% for 5-10 days. No refund within 5 days.")
                .coverImage("https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800")
                .images("[\"https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800\",\"https://images.unsplash.com/photo-1570804439064-eed8db8f70ae?w=800\",\"https://images.unsplash.com/photo-1609947017136-9daf32a3fc6a?w=800\"]")
                .packageType(PackageType.PILGRIMAGE)
                .status(PackageStatus.ACTIVE)
                .featured(false)
                .rating(4.4)
                .reviewCount(92)
                .agency(agency3)
                .build());
        
        // Package 8 - Sikkim Northeast
        packageRepository.save(TravelPackage.builder()
                .title("Enchanting Sikkim & Darjeeling")
                .description("Discover the hidden gems of Northeast India. Visit Gangtok, Pelling, Darjeeling, and witness the majestic Kanchenjunga views.")
                .destination("Sikkim")
                .origin("Bagdogra")
                .price(new BigDecimal("38000"))
                .discountedPrice(new BigDecimal("34999"))
                .durationDays(8)
                .durationNights(7)
                .totalSeats(20)
                .availableSeats(11)
                .startDate(LocalDate.now().plusDays(22))
                .endDate(LocalDate.now().plusDays(30))
                .inclusions("Mountain view hotels,All meals,Permit arrangements,Sightseeing by Innova,Tsomgo Lake & Nathula excursion,Toy train ride,All entry fees")
                .exclusions("Flights,Personal expenses,Yak ride,Cable car")
                .itinerary("[{\"day\":1,\"title\":\"Arrival Bagdogra\",\"description\":\"Drive to Gangtok, evening MG Marg\"},{\"day\":2,\"title\":\"Gangtok\",\"description\":\"Rumtek Monastery, Do Drul Chorten, local markets\"},{\"day\":3,\"title\":\"Tsomgo & Nathula\",\"description\":\"Visit Tsomgo Lake and Nathula Pass (China border)\"},{\"day\":4,\"title\":\"Gangtok to Pelling\",\"description\":\"Drive to Pelling via Ravangla\"},{\"day\":5,\"title\":\"Pelling\",\"description\":\"Pemayangtse Monastery, Rabdentse Ruins, Khecheopalri Lake\"},{\"day\":6,\"title\":\"Pelling to Darjeeling\",\"description\":\"Scenic drive to Darjeeling\"},{\"day\":7,\"title\":\"Darjeeling\",\"description\":\"Tiger Hill sunrise, Batasia Loop, tea estate visit\"},{\"day\":8,\"title\":\"Departure\",\"description\":\"Toy train ride, transfer to Bagdogra airport\"}]")
                .termsAndConditions("Indian nationals need Inner Line Permit (arranged by us). Foreign nationals need Protected Area Permit. Warm clothing essential.")
                .cancellationPolicy("70% refund 15+ days before. 50% for 7-15 days. 25% for 3-7 days. No refund within 3 days.")
                .coverImage("https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800")
                .images("[\"https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800\",\"https://images.unsplash.com/photo-1622308644420-452e9bf1e8ca?w=800\",\"https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800\"]")
                .packageType(PackageType.ADVENTURE)
                .status(PackageStatus.ACTIVE)
                .featured(false)
                .rating(4.6)
                .reviewCount(54)
                .agency(agency1)
                .build());
        
        log.info("Created 3 agencies and 8 travel packages");
    }
}

