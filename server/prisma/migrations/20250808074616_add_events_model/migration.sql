/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Meeting` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `googleId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Meeting" DROP CONSTRAINT "Meeting_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "password",
ADD COLUMN     "accessToken" TEXT NOT NULL,
ADD COLUMN     "googleId" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."Meeting";

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "googleEventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "startDateTime" TIMESTAMP(3),
    "endDateTime" TIMESTAMP(3),
    "attendees" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_googleEventId_userId_key" ON "public"."Event"("googleEventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "public"."User"("googleId");

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
