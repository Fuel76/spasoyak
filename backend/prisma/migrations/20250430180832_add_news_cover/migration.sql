/*
  Warnings:

  - You are about to drop the column `createdAt` on the `carouselimage` table. All the data in the column will be lost.
  - You are about to alter the column `url` on the `carouselimage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `carouselimage` DROP COLUMN `createdAt`,
    MODIFY `url` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `news` ADD COLUMN `cover` VARCHAR(191) NULL;
