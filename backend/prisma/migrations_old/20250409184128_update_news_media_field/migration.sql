/*
  Warnings:

  - Added the required column `media` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `news` ADD COLUMN `htmlContent` VARCHAR(191) NULL,
    ADD COLUMN `media` JSON NOT NULL;
