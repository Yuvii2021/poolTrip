# TravelHub - Travel Marketplace Platform

A complete travel marketplace where travel agencies post group trip packages and travelers browse, search, and book seats. Two user roles: **Traveler** (USER) and **Agency** (AGENCY). Backend in Spring Boot, web frontend in React, mobile app in React Native / Expo.

---

## UI Design Brief (for AI design tools)

> Use this section as a prompt for any UI design AI (Figma AI, v0, Galileo, etc.) to generate screens that match the app's real data and flows.

### App Concept

TravelHub is a **group travel pooling marketplace**. Agencies post curated trip packages (Kashmir 6D/5N, Goa Beach 4D/3N, etc.) with photos, itinerary, inclusions/exclusions, pricing, and seat limits. Travelers search by origin city + destination, filter by price/duration/transport/category, and book seats on trips. Think "Airbnb for group travel packages" — the host is a travel agency, the product is a multi-day trip.

### Two User Roles

**Traveler (USER):**
- Browse/search packages by origin city, destination, departure date
- Filter by price range, duration, transport type (Bus AC, Flight, Car, Train, etc.), featured
- View package detail with photo gallery, day-by-day itinerary, inclusions/exclusions, terms
- Book seats (1 to N seats, optional message to host), instant confirm or host-approval mode
- Manage bookings: view status (Pending/Confirmed/Rejected/Cancelled), cancel, rate + review after trip
- Profile: photo, name, email, phone, WhatsApp, bio, email verification with OTP
- Contact agency via phone call or WhatsApp directly from package detail

**Agency act as (USER):**
- Dashboard with stats: total packages, pending bookings, confirmed bookings
- Create/edit/delete travel packages with: title, description, photos/videos (Cloudinary), origin, destination, price, discounted price, duration (days/nights), departure date, total seats, package type, transport mode, itinerary (per-day), inclusions, exclusions, terms, cancellation policy, featured flag, instant booking toggle
- Manage incoming booking requests: approve/reject, contact traveler (call/WhatsApp)
- Same profile features as traveler

### Screens to Design

| # | Screen | Key Elements |
|---|--------|-------------|
| 1 | **Login** | Phone + password, "Forgot Password?" link, "Register" link, brand header |
| 2 | **Register** | Step 1: name, email, phone, password, USER/AGENCY toggle (if Agency: agency name + WhatsApp). Step 2: OTP verification |
| 3 | **Forgot Password** | Step 1: phone input → send OTP. Step 2: OTP + new password + confirm |
| 4 | **Explore / Home** | Hero with origin + destination + date search bar + search button + filter button. Category chips (Adventure, Beach, Cultural, Honeymoon, Family, Pilgrimage, Wildlife, Cruise, Luxury, Budget). Featured packages horizontal carousel. Popular trips vertical grid. Each card: hero image, rating badge, duration badge, discount badge, title, posted-by row (avatar + name + verified tick), origin → destination route, transport icon + label, price, seats left |
| 5 | **Filter Sheet** | Modal/bottom-sheet: price range (min/max), duration range (min/max days), transport type chips (Car, SUV, Bus AC, Bus Non-AC, Train, Flight Economy, Flight Business, Bike, Self), featured toggle, Apply + Clear buttons |
| 6 | **Package Detail** | Hero image slider (auto-advance, dots, counter). Overlapping info card: price (with strikethrough if discount), duration, location. 3 tabs: Overview (description, inclusions ✓ grid, exclusions ✕ grid, photo gallery), Itinerary (timeline with day dots + descriptions), Terms (cancellation policy, T&C). Booking section: seat selector (+/−), message textarea, price summary, confirm button. Status banner if already booked. Posted-by card: host photo, name, verified badge, star rating, contact buttons. Sticky bottom bar: "Call Agency" + "WhatsApp" pill buttons |
| 7 | **My Bookings** | Tab pills: All / Confirmed / Pending / Past (with counts). Each card: package image, title (tappable → detail), origin → destination, date, seats, status badge (green/amber/red/gray), transport tag. Rating section if trip completed: 5-star picker + review textarea + submit. Host info row + contact buttons. Cancel button for active bookings |
| 8 | **Agency Dashboard** | Welcome header with agency name. 3 stat cards (total packages / pending bookings / confirmed). Booking requests list: passenger photo + name + package + seats + message + approve/reject buttons. My packages list: image + title + destination + price + duration + status + edit/delete/view. Floating "+" button to create package |
| 9 | **Create/Edit Package** | Sectioned form: Basic Info (title, category chips, transport chips, featured switch, instant-booking switch, description), Location (origin, destination), Pricing (price, discounted price), Schedule (days, nights, start date, total seats), Itinerary (dynamic day list with add/remove), Details (inclusions, exclusions, terms, cancellation), Media (existing thumbnails + remove). Sticky footer: Save Draft + Publish buttons |
| 10 | **Profile** | Avatar (editable), name, email, phone, agency name if agency. Verification progress bar (phone ✓, email, photo, bio = 4 steps). Email verify button → OTP modal. Edit mode: text fields for name, email, WhatsApp, bio. Logout button |

### Data Available Per Package Card

Every package card has these fields available for display:

```
title, destination, origin, price, discountedPrice, durationDays, durationNights,
startDate, availableSeats, totalSeats, packageType (+ label + icon emoji),
transportation (+ label + icon emoji), media[] (image/video URLs),
rating, reviewCount, featured, instantBooking, status,
postedByName, postedByPhoto, postedByVerified,
agencyName, agencyPhone, agencyWhatsapp
```

### Data Available Per Booking Card

```
packageTitle, packageDestination, packageOrigin, packageStartDate,
packageDurationDays, packageImage, transportationLabel, transportationIcon,
hostName, hostPhoto, hostPhone, hostWhatsapp,
passengerName, passengerPhoto, passengerPhone, passengerWhatsapp,
seatsBooked, message, status (PENDING|CONFIRMED|REJECTED|CANCELLED),
instantBooking, rating, review, createdAt, respondedAt
```

### Package Types (categories with icons from backend)

Adventure, Beach, Cultural, Honeymoon, Family, Pilgrimage, Wildlife, Cruise, Luxury, Budget

### Transport Modes (from backend)

Car, SUV, Bus AC, Bus Non-AC, Mini Bus, Tempo, Train, Flight Economy, Flight Business, Bike, Self Drive

### Design Direction

- Modern, premium feel with generous white space
- No harsh 1px borders — use tonal surface layering (white cards on light gray background)
- Pill-shaped buttons with rounded full radius
- Large card radius (20-28px)
- Soft ambient shadows, not drop shadows
- Editorial photography style — images are the hero, UI frames them
- Typography: bold display headlines + clean readable body text
- Color: primary blue for trust + warm orange/coral for CTAs and accents
- Glass-style overlays on images (translucent badges for rating, duration, discount)

---

## Tech Stack

### Backend (Spring Boot)
- **Spring Boot 3.2** — Java 17+
- **MySQL 8** — relational database
- **Spring Security + JWT** — stateless token auth
- **Spring Data JPA + Hibernate** — ORM
- **Cloudinary** — image/video hosting
- **Spring Mail** — OTP emails
- **Redis** (optional) — caching
- **Lombok** — boilerplate reduction

### Web Frontend (React + Vite)
- **React 19** + **TypeScript**
- **Vite 5** — dev server & bundler
- **React Router 6** — client-side routing
- **Axios** — HTTP client
- **Framer Motion** — animations
- **Lucide React** — icons
- **CSS Modules** — scoped styling
- **DM Sans + Playfair Display** — fonts

### Mobile App (React Native + Expo)
- **Expo SDK 54** + **TypeScript**
- **React Navigation** — native stack + bottom tabs
- **Axios** + **AsyncStorage** — HTTP + local token storage
- **Expo Linear Gradient** — gradient backgrounds
- **Plus Jakarta Sans + Inter** — fonts

## Project Structure

```
poolTrip/
├── backend/                          # Spring Boot REST API
│   ├── src/main/java/com/travelhub/
│   │   ├── controller/               # AuthController, PackageController, BookingController, SubscriberController
│   │   ├── dto/                      # Request/response DTOs, FilterOptionsResponse
│   │   ├── entity/                   # User, TravelPackage, Booking, OtpVerification, Subscriber
│   │   ├── repository/               # JPA repositories
│   │   ├── security/                 # SecurityConfig, JwtAuthenticationFilter, JwtUtil
│   │   ├── service/                  # Business logic services
│   │   └── exception/                # GlobalExceptionHandler
│   └── src/main/resources/
│       └── application.yml           # DB, JWT, Cloudinary, Mail config
│
├── frontend/                         # React web app (Vite)
│   └── src/
│       ├── pages/                    # HomePage, PackageDetailPage, DashboardPage, MyBookingsPage, ProfilePage, LoginPage, RegisterPage, etc.
│       ├── components/               # Navbar, Footer, PackageCard, FilterSidebar, LocationAutocomplete, WhatsAppButton
│       ├── context/                  # AuthContext (localStorage + JWT)
│       ├── services/                 # api.ts (all API calls)
│       └── types/                    # TypeScript interfaces
│
└── mobile/                           # React Native app (Expo)
    ├── App.tsx                       # Font loading + AuthProvider + Navigator
    └── src/
        ├── screens/                  # ExploreScreen, PackageDetailScreen, MyBookingsScreen, DashboardScreen, CreatePackageScreen, ProfileScreen, LoginScreen, RegisterScreen, ForgotPasswordScreen
        ├── components/               # EditorialCard, PrimaryButton, FilterChips, FilterSheet, LoadingState, EmptyState
        ├── navigation/               # AppNavigator (auth stack + role-based tabs)
        ├── context/                  # AuthContext (AsyncStorage + JWT)
        ├── services/                 # api.ts (same endpoints as web)
        ├── theme/                    # colors, typography, spacing, radius, shadows
        └── types/                    # TypeScript interfaces (shared with web)
```

## API Endpoints (Full)

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login with phone + password. Returns JWT token + user info |
| POST | `/api/auth/register` | No | Register with email, password, fullName, phone, OTP, role. Requires phone OTP first |
| GET | `/api/auth/me` | Yes | Get current user's full profile |
| PUT | `/api/auth/me` | Yes | Update profile (fullName, email, whatsappNumber, bio) |
| POST | `/api/auth/me/profile-photo` | Yes | Upload profile photo (multipart) |
| GET | `/api/auth/user/{id}` | No | Get public user profile by ID |
| POST | `/api/auth/send-otp` | No | Send SMS OTP to phone (for registration) |
| POST | `/api/auth/email/send-otp` | Yes | Send email OTP (for email verification) |
| POST | `/api/auth/email/verify-otp` | Yes | Verify email OTP |
| POST | `/api/auth/forgot-password` | No | Send password reset OTP |
| POST | `/api/auth/reset-password` | No | Reset password with phone + OTP + newPassword |

### Packages
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/packages` | No | List all active packages. Optional query: minPrice, maxPrice, days, transportation, featured |
| GET | `/api/packages/featured` | No | Get featured packages only |
| GET | `/api/packages/{id}` | No | Get single package with full details |
| GET | `/api/packages/search?query=` | No | Text search packages |
| GET | `/api/packages/search-nearby?origin=&destination=` | No | Search by origin + destination, sorted by distance |
| GET | `/api/packages/search-from-origin?origin=` | No | Search all packages sorted by distance from origin |
| GET | `/api/packages/type/{type}` | No | Get packages by category type. Same optional filters as /packages |
| GET | `/api/packages/filter-options` | No | Get dynamic filter options: packageTypes[], transportationOptions[], priceRange, durationOptions[] |
| GET | `/api/packages/my-packages` | Yes | Get current agency's packages |
| GET | `/api/packages/user/{userId}` | No | Get packages by specific user/agency |
| POST | `/api/packages` | Yes | Create package (multipart: form fields + media files) |
| PUT | `/api/packages/{id}` | Yes | Update package (multipart, with existingMediaUrls to retain) |
| DELETE | `/api/packages/{id}` | Yes | Delete package |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | Yes | Create booking (packageId, seats, message?) |
| GET | `/api/bookings/my` | Yes | Get traveler's own bookings |
| GET | `/api/bookings/host` | Yes | Get agency's incoming bookings |
| GET | `/api/bookings/host/pending` | Yes | Get agency's pending bookings only |
| GET | `/api/bookings/status/{packageId}` | Yes | Check if user has active booking on a package |
| POST | `/api/bookings/{id}/approve` | Yes | Agency approves booking |
| POST | `/api/bookings/{id}/reject` | Yes | Agency rejects booking |
| POST | `/api/bookings/{id}/cancel` | Yes | Cancel booking (traveler or agency) |
| POST | `/api/bookings/{id}/rate` | Yes | Rate a completed trip (rating: 1-5, review?: string) |

### Other
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/subscribe` | No | Newsletter subscription (email) |

## Getting Started

### Prerequisites
- Java 17+, Maven
- MySQL 8+
- Node.js 18+

### 1. Setup Database

```sql
CREATE DATABASE travel_marketplace;
```

Update `backend/src/main/resources/application.yml` with your MySQL credentials.

### 2. Run Backend

```bash
cd backend
mvn spring-boot:run
```

API starts at `http://localhost:8090`

### 3. Run Web Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`

### 4. Run Mobile App

```bash
cd mobile
npm install
npx expo start
```

Press `w` for web, `a` for Android emulator, `i` for iOS simulator, or scan QR with Expo Go.

### 5. Configure Mobile API URL

Edit `mobile/.env`:

```bash
# Web / iOS Simulator
EXPO_PUBLIC_API_BASE_URL=http://localhost:8090/api

# Android Emulator
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8090/api

# Physical Device (your computer's local IP)
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8090/api
```

## Demo Credentials

### Traveler
- **Phone:** (check database after seed)
- **Password:** password123

### Travel Agencies
- **Email:** wanderlust@agency.com / **Password:** password123
- **Email:** paradise@tours.com / **Password:** password123
- **Email:** heritage@india.com / **Password:** password123

## Sample Packages Included

1. Magical Kashmir Valley Tour (6D/5N)
2. Goa Beach Paradise (4D/3N)
3. Royal Rajasthan Heritage Tour (8D/7N)
4. Kerala Backwaters & Hills (5D/4N)
5. Leh Ladakh Bike Expedition (7D/6N)
6. Andaman Islands Escape (5D/4N)
7. Spiritual Varanasi & Bodh Gaya (4D/3N)
8. Enchanting Sikkim & Darjeeling (6D/5N)

## License

MIT License

---

Built for the travel community.
