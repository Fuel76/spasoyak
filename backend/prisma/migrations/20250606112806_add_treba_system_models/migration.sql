/*
  Warnings:

  - You are about to drop the column `email` on the `Treba` table. All the data in the column will be lost.
  - You are about to drop the column `names` on the `Treba` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `Treba` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `Treba` table. All the data in the column will be lost.
  - You are about to drop the `TrebaFormField` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrebaPricingRule` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `Treba` DROP COLUMN `email`,
    DROP COLUMN `names`,
    DROP COLUMN `paymentId`,
    DROP COLUMN `paymentStatus`,
    ADD COLUMN `isAnonymous` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `status` ENUM('PENDING', 'ACCEPTED', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `userId` INTEGER NULL,
    MODIFY `currency` VARCHAR(191) NULL DEFAULT 'RUB';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `phone` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `TrebaFormField`;

-- DropTable
DROP TABLE `TrebaPricingRule`;

-- CreateTable
CREATE TABLE `TrebaName` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trebaId` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('ZA_ZDRAVIE', 'ZA_UPOKOI', 'SOROKOUST') NOT NULL DEFAULT 'ZA_ZDRAVIE',
    `rank` VARCHAR(191) NULL,
    `isValid` BOOLEAN NOT NULL DEFAULT true,
    `validationError` VARCHAR(191) NULL,
    `churchForm` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `trebaId` INTEGER NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'RUB',
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `method` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_trebaId_key`(`trebaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `trebaId` INTEGER NULL,
    `type` ENUM('EMAIL', 'SMS', 'PUSH', 'TELEGRAM') NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `message` VARCHAR(191) NOT NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CalendarEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trebaId` INTEGER NULL,
    `date` DATETIME(3) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrebaStatusHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trebaId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `comment` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Treba` ADD CONSTRAINT `Treba_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrebaName` ADD CONSTRAINT `TrebaName_trebaId_fkey` FOREIGN KEY (`trebaId`) REFERENCES `Treba`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_trebaId_fkey` FOREIGN KEY (`trebaId`) REFERENCES `Treba`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_trebaId_fkey` FOREIGN KEY (`trebaId`) REFERENCES `Treba`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CalendarEvent` ADD CONSTRAINT `CalendarEvent_trebaId_fkey` FOREIGN KEY (`trebaId`) REFERENCES `Treba`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrebaStatusHistory` ADD CONSTRAINT `TrebaStatusHistory_trebaId_fkey` FOREIGN KEY (`trebaId`) REFERENCES `Treba`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
