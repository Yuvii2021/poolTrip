-- Migration script to add HONEYMOON to package_type enum
-- Run this SQL script on your MySQL database

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
