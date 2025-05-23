-- AlterTable
ALTER TABLE `news` MODIFY `title` VARCHAR(255) NOT NULL,
    MODIFY `content` TEXT NOT NULL,
    MODIFY `htmlContent` TEXT NULL;

-- AlterTable
ALTER TABLE `page` MODIFY `content` TEXT NOT NULL,
    MODIFY `slug` VARCHAR(255) NOT NULL,
    MODIFY `title` VARCHAR(255) NOT NULL;
