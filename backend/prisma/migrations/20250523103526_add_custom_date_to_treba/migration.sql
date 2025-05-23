/*
  Warnings:

  - A unique constraint covering the columns `[name,periodValue]` on the table `TrebaPricingRule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `TrebaPricingRule` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `TrebaPricingRule_periodValue_key` ON `TrebaPricingRule`;

-- AlterTable
ALTER TABLE `Treba` ADD COLUMN `customDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `TrebaPricingRule` ADD COLUMN `name` VARCHAR(191) NOT NULL,
    MODIFY `description` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `TrebaPricingRule_name_periodValue_key` ON `TrebaPricingRule`(`name`, `periodValue`);
