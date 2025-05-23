-- AlterTable
ALTER TABLE `Treba` ADD COLUMN `calculatedPrice` DOUBLE NULL,
    ADD COLUMN `currency` VARCHAR(191) NULL,
    ADD COLUMN `dynamicFieldsData` JSON NULL;

-- CreateTable
CREATE TABLE `TrebaFormField` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fieldName` VARCHAR(191) NOT NULL,
    `fieldType` ENUM('TEXT', 'TEXTAREA', 'SELECT', 'RADIO', 'CHECKBOX', 'NUMBER') NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `options` JSON NULL,
    `placeholder` VARCHAR(191) NULL,
    `isRequired` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TrebaFormField_fieldName_key`(`fieldName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrebaPricingRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `periodValue` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `priceType` ENUM('PER_NAME', 'PER_TEN_NAMES', 'FIXED') NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'RUB',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TrebaPricingRule_periodValue_key`(`periodValue`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
