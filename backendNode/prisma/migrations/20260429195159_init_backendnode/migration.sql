-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `whatsapp_number` VARCHAR(20) NULL,
    `bio` TEXT NULL,
    `profile_photo` TEXT NULL,
    `phone_verified` BOOLEAN NOT NULL DEFAULT true,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `review_count` INTEGER NOT NULL DEFAULT 0,
    `number_of_trips` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `travel_packages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `description` TEXT NULL,
    `origin_name` VARCHAR(191) NOT NULL,
    `origin_latitude` DOUBLE NOT NULL,
    `origin_longitude` DOUBLE NOT NULL,
    `destination_name` VARCHAR(191) NOT NULL,
    `destination_latitude` DOUBLE NOT NULL,
    `destination_longitude` DOUBLE NOT NULL,
    `price` INTEGER NOT NULL,
    `discounted_price` INTEGER NULL,
    `duration_days` INTEGER NOT NULL,
    `duration_nights` INTEGER NOT NULL,
    `total_seats` INTEGER NOT NULL,
    `available_seats` INTEGER NOT NULL,
    `start_date` DATE NULL,
    `inclusions` TEXT NULL,
    `exclusions` TEXT NULL,
    `transportation` VARCHAR(64) NULL,
    `terms_and_conditions` TEXT NULL,
    `cancellation_policy` TEXT NULL,
    `status` ENUM('ACTIVE', 'FULL', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `package_type` VARCHAR(64) NOT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `instant_booking` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `travel_packages_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `package_media` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `package_id` BIGINT UNSIGNED NOT NULL,
    `media_url` TEXT NOT NULL,

    INDEX `package_media_package_id_idx`(`package_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `package_itinerary` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `package_id` BIGINT UNSIGNED NOT NULL,
    `itinerary_item` TEXT NOT NULL,

    INDEX `package_itinerary_package_id_idx`(`package_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `passenger_id` BIGINT UNSIGNED NOT NULL,
    `package_id` BIGINT UNSIGNED NOT NULL,
    `seats_booked` INTEGER NOT NULL,
    `message` TEXT NULL,
    `rating` INTEGER NULL,
    `review` TEXT NULL,
    `rated_at` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `responded_at` DATETIME(3) NULL,

    INDEX `bookings_passenger_id_idx`(`passenger_id`),
    INDEX `bookings_package_id_idx`(`package_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscribers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `subscribed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `subscribers_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp_verification` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NOT NULL,
    `otp` VARCHAR(20) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,

    INDEX `otp_verification_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `travel_packages` ADD CONSTRAINT `travel_packages_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_media` ADD CONSTRAINT `package_media_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `travel_packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_itinerary` ADD CONSTRAINT `package_itinerary_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `travel_packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `travel_packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
