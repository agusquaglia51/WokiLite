/*
  Warnings:

  - You are about to drop the column `idempotencyKeyId` on the `Reservation` table. All the data in the column will be lost.
  - Added the required column `reservationId` to the `IdempotencyKey` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Reservation" DROP CONSTRAINT "Reservation_idempotencyKeyId_fkey";

-- DropIndex
DROP INDEX "public"."Reservation_idempotencyKeyId_key";

-- AlterTable
ALTER TABLE "IdempotencyKey" ADD COLUMN     "reservationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "idempotencyKeyId";

-- CreateIndex
CREATE INDEX "IdempotencyKey_reservationId_idx" ON "IdempotencyKey"("reservationId");
