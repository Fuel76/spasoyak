-- CreateTable
CREATE TABLE `calendar_days` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `priority` ENUM('GREAT_FEAST', 'TWELVE_FEAST', 'POLYELEOS', 'VIGIL', 'SIXTH_CLASS', 'NORMAL') NOT NULL DEFAULT 'NORMAL',
    `fastingType` ENUM('NONE', 'STRICT', 'FISH_ALLOWED', 'WINE_OIL', 'DRY_EATING', 'FULL_FAST') NOT NULL DEFAULT 'NONE',
    `isHoliday` BOOLEAN NOT NULL DEFAULT false,
    `color` VARCHAR(191) NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `calendar_days_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saints` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(500) NOT NULL,
    `description` TEXT NULL,
    `icon` VARCHAR(191) NULL,
    `priority` ENUM('GREAT_SAINT', 'POLYELEOS_SAINT', 'VIGIL_SAINT', 'SIXTH_CLASS', 'COMMEMORATED') NOT NULL DEFAULT 'COMMEMORATED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `readings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('APOSTLE', 'GOSPEL', 'OLD_TESTAMENT', 'PROKEIMENON', 'ALLELUIA') NOT NULL,
    `reference` VARCHAR(255) NOT NULL,
    `title` VARCHAR(500) NULL,
    `text` LONGTEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `calendarDayId` INTEGER NULL,
    `date` DATE NOT NULL,
    `time` VARCHAR(10) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('REGULAR', 'LITURGY', 'VESPERS', 'MATINS', 'MOLEBEN', 'PANIKHIDA', 'AKATHIST', 'SPECIAL') NOT NULL DEFAULT 'REGULAR',
    `priority` ENUM('HOLIDAY', 'SPECIAL', 'NORMAL') NOT NULL DEFAULT 'NORMAL',
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `schedules_date_idx`(`date`),
    INDEX `schedules_calendarDayId_idx`(`calendarDayId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CalendarDayToSaint` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CalendarDayToSaint_AB_unique`(`A`, `B`),
    INDEX `_CalendarDayToSaint_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CalendarDayToReading` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CalendarDayToReading_AB_unique`(`A`, `B`),
    INDEX `_CalendarDayToReading_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_calendarDayId_fkey` FOREIGN KEY (`calendarDayId`) REFERENCES `calendar_days`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CalendarDayToSaint` ADD CONSTRAINT `_CalendarDayToSaint_A_fkey` FOREIGN KEY (`A`) REFERENCES `calendar_days`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CalendarDayToSaint` ADD CONSTRAINT `_CalendarDayToSaint_B_fkey` FOREIGN KEY (`B`) REFERENCES `saints`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CalendarDayToReading` ADD CONSTRAINT `_CalendarDayToReading_A_fkey` FOREIGN KEY (`A`) REFERENCES `calendar_days`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CalendarDayToReading` ADD CONSTRAINT `_CalendarDayToReading_B_fkey` FOREIGN KEY (`B`) REFERENCES `readings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
