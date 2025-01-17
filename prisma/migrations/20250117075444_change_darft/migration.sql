/*
  Warnings:

  - You are about to drop the column `parentId` on the `article` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[darftId]` on the table `Article` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `article` DROP COLUMN `parentId`;

-- CreateIndex
CREATE UNIQUE INDEX `Article_darftId_key` ON `Article`(`darftId`);

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_darftId_fkey` FOREIGN KEY (`darftId`) REFERENCES `Article`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
