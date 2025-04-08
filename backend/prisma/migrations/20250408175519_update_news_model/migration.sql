/*
  Warnings:

  - Added the required column `updatedAt` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `news` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
