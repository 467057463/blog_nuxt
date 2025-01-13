/*
  Warnings:

  - Added the required column `categoryId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tag` ADD COLUMN `categoryId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
