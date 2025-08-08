/*
  Warnings:

  - You are about to drop the column `accessToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."User_googleId_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "accessToken",
DROP COLUMN "googleId",
DROP COLUMN "refreshToken",
DROP COLUMN "updatedAt",
ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."Meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Meeting" ADD CONSTRAINT "Meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
