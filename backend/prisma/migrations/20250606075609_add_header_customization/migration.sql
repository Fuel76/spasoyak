-- AlterTable
ALTER TABLE `News` ADD COLUMN `headerColor` VARCHAR(7) NOT NULL DEFAULT '#f8f9fa',
    ADD COLUMN `headerStyle` VARCHAR(20) NOT NULL DEFAULT 'default';
