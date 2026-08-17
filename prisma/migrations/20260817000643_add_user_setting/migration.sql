-- CreateTable
CREATE TABLE "UserSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_key" ON "UserSetting"("userId");

-- AddForeignKey
ALTER TABLE "UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: Prisma @default(cuid()) is client-side. Existing User
-- ids are cuid TEXT (e.g. cmsw…), not UUIDs. Mint matching TEXT ids
-- with a `c` prefix instead of gen_random_uuid().
INSERT INTO "UserSetting" (id, "userId", preferences, "createdAt", "updatedAt")
SELECT
  'c' || substr(md5(u.id || clock_timestamp()::text), 1, 24),
  u.id,
  '{}'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1 FROM "UserSetting" s WHERE s."userId" = u.id
);
