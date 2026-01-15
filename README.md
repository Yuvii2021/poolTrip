# 🌍 TravelHub - Travel Marketplace Platform

A complete travel marketplace where travel agencies can post packages and users can browse and book them.

![TravelHub](https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800)

## 🚀 Features

### For Travelers (Users)
- 📱 Beautiful mobile app with modern UI
- 🔍 Browse and search travel packages
- 🏷️ Filter by categories (Adventure, Beach, Cultural, etc.)
- ⭐ View featured packages
- 📋 Detailed package information with itinerary
- 📞 Contact agency directly via call or WhatsApp
- 💰 View pricing, discounts, and available seats

### For Travel Agencies
- 📊 Dedicated dashboard to manage packages
- ➕ Create new travel packages with full details
- ✏️ Edit and update existing packages
- 🗑️ Delete packages
- 📈 View statistics (total, active, featured packages)

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.2** - Java framework
- **MySQL** - Database
- **Spring Security + JWT** - Authentication
- **Spring Data JPA** - ORM
- **Lombok** - Boilerplate reduction

### Mobile App
- **React Native** - Cross-platform mobile
- **Expo** - Development framework
- **TypeScript** - Type safety
- **React Navigation** - Navigation
- **Axios** - API calls
- **AsyncStorage** - Local storage

## 📁 Project Structure

```
travel-marketplace/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/com/travelhub/
│   │   ├── config/            # Data initializer
│   │   ├── controller/        # REST controllers
│   │   ├── dto/               # Data transfer objects
│   │   ├── entity/            # JPA entities
│   │   ├── exception/         # Exception handlers
│   │   ├── repository/        # Data repositories
│   │   ├── security/          # JWT & Security config
│   │   └── service/           # Business logic
│   └── src/main/resources/
│       └── application.yml    # Configuration
│
└── mobile/                     # React Native App
    ├── App.tsx                # Entry point
    └── src/
        ├── components/        # Reusable components
        ├── context/           # Auth context
        ├── navigation/        # Navigation config
        ├── screens/           # App screens
        ├── services/          # API services
        ├── theme/             # Colors & styling
        └── types/             # TypeScript types
```

## 🚦 Getting Started

### Prerequisites
- Java 17+
- Maven
- MySQL 8+
- Node.js 18+
- Expo CLI

### 1. Setup MySQL Database

```sql
CREATE DATABASE travel_marketplace;
```

Update credentials in `backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/travel_marketplace
    username: your_username
    password: your_password
```

### 2. Run Backend

```bash
cd backend
mvn spring-boot:run
```

The API will start at `http://localhost:8080`

### 3. Run Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan QR code with Expo Go app or run on emulator.

### 4. Update API URL (Important!)

In `mobile/src/services/api.ts`, update the API URL:

```typescript
// For Android Emulator:
const API_BASE_URL = 'http://10.0.2.2:8080/api';

// For iOS Simulator:
const API_BASE_URL = 'http://localhost:8080/api';

// For Physical Device (use your computer's IP):
const API_BASE_URL = 'http://YOUR_IP:8080/api';
```

## 👤 Demo Credentials

The app comes pre-loaded with sample data:

### Regular User
- **Email:** user@test.com
- **Password:** password123

### Travel Agencies
- **Email:** wanderlust@agency.com
- **Password:** password123

- **Email:** paradise@tours.com
- **Password:** password123

- **Email:** heritage@india.com
- **Password:** password123

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user/agency |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Packages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/packages` | Get all active packages |
| GET | `/api/packages/featured` | Get featured packages |
| GET | `/api/packages/{id}` | Get package by ID |
| GET | `/api/packages/search?query=` | Search packages |
| GET | `/api/packages/type/{type}` | Get by type |
| GET | `/api/packages/my-packages` | Get agency's packages |
| POST | `/api/packages` | Create package (Agency) |
| PUT | `/api/packages/{id}` | Update package (Agency) |
| DELETE | `/api/packages/{id}` | Delete package (Agency) |

## 📱 App Screenshots

### User Screens
- **Login/Register** - Beautiful gradient UI with role selection
- **Home** - Browse packages with category filters
- **Package Detail** - Full details, itinerary, terms, booking buttons

### Agency Screens
- **Dashboard** - Statistics & package management
- **Create Package** - Full-featured form

## 🎨 Design System

The app uses a modern dark theme with:
- **Primary:** Cyan (#0EA5E9)
- **Secondary:** Orange (#F97316)
- **Accent:** Emerald (#10B981)
- **Background:** Deep Navy (#0F172A)

## 📦 Sample Packages Included

1. 🏔️ Magical Kashmir Valley Tour
2. 🏖️ Goa Beach Paradise
3. 🏛️ Royal Rajasthan Heritage Tour
4. 🌴 Kerala Backwaters & Hills
5. 🏍️ Leh Ladakh Bike Expedition
6. 🏝️ Andaman Islands Escape
7. ⛩️ Spiritual Varanasi & Bodh Gaya
8. 🏔️ Enchanting Sikkim & Darjeeling

## 📄 License

MIT License

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

Built with ❤️ for the travel community

