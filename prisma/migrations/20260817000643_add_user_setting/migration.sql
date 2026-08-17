-- CreateTable
CREATE TABLE "UserSetting" (
    "userId" TEXT NOT NULL,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: existing users get an empty preferences document.
-- userId is the PK (1:1 with User); no separate id column.
INSERT INTO "UserSetting" ("userId", preferences, "createdAt", "updatedAt")
SELECT
  u.id,
  '{}'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1 FROM "UserSetting" s WHERE s."userId" = u.id
);
