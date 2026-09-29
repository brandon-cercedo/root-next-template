-- DropIndex
DROP INDEX "ChatSession_userId_updatedAt_idx";

-- AlterTable
ALTER TABLE "ChatSession" ADD COLUMN     "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "ChatSession_userId_lastMessageAt_idx" ON "ChatSession"("userId", "lastMessageAt");
