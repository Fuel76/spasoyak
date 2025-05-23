/*
  Warnings:

  - Added the required column `updatedAt` to the `Treba` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Treba` ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `period` VARCHAR(191) NOT NULL DEFAULT 'Разовое',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `names` TEXT NOT NULL,
    MODIFY `note` TEXT NULL;
