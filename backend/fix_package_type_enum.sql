-- Option 1: Add HONEYMOON to existing ENUM (if column is ENUM)
ALTER TABLE travel_packages 
MODIFY COLUMN package_type ENUM(
    'HILLS',
    'BEACH',
    'CITY',
    'PILGRIMAGE',
    'ADVENTURE',
    'WILDLIFE',
    'ROAD_TRIP',
    'HONEYMOON'
) NOT NULL;

-- Option 2: Change to VARCHAR for more flexibility (if Option 1 doesn't work)
-- ALTER TABLE travel_packages 
-- MODIFY COLUMN package_type VARCHAR(50) NOT NULL;
