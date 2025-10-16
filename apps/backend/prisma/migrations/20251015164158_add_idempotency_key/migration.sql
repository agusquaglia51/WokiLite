/*
  Warnings:

  - You are about to drop the column `reservationId` on the `IdempotencyKey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idempotencyKeyId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."IdempotencyKey_reservationId_idx";

-- AlterTable
ALTER TABLE "IdempotencyKey" DROP COLUMN "reservationId";

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "idempotencyKeyId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_idempotencyKeyId_key" ON "Reservation"("idempotencyKeyId");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_idempotencyKeyId_fkey" FOREIGN KEY ("idempotencyKeyId") REFERENCES "IdempotencyKey"("key") ON DELETE SET NULL ON UPDATE CASCADE;
