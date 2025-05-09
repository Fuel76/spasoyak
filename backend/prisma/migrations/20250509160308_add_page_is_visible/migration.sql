/*
  Warnings:

  - You are about to alter the column `slug` on the `page` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `title` on the `page` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - Added the required column `updatedAt` to the `carouselImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Page` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `carouselimage` ADD COLUMN `alt` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `title` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `page` ADD COLUMN `customCss` LONGTEXT NULL,
    ADD COLUMN `history` JSON NULL,
    ADD COLUMN `isVisible` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `metaDescription` TEXT NULL,
    ADD COLUMN `metaKeywords` TEXT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `content` LONGTEXT NOT NULL,
    MODIFY `slug` VARCHAR(191) NOT NULL,
    MODIFY `title` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `name` VARCHAR(191) NULL,
    MODIFY `updatedAt` DATETIME(3) NOT NULL;
