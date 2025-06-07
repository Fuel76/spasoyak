-- CreateTable
CREATE TABLE `treba_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `basePrice` DOUBLE NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'RUB',
    `period` VARCHAR(50) NOT NULL DEFAULT 'Разовое',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `treba_types_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
