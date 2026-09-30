-- Fix existing staff rank values to match the 6 canonical ranks
-- This migration updates legacy rank values that use tildes, slashes, or different casings

-- Co~Founder -> Co-Founder
UPDATE "Staff" SET "rank" = 'Co-Founder' WHERE "rank" = 'Co~Founder';

-- Co~Owner -> Co-Owner
UPDATE "Staff" SET "rank" = 'Co-Owner' WHERE "rank" = 'Co~Owner';

-- Safe~Guarding -> Safeguarding
UPDATE "Staff" SET "rank" = 'Safeguarding' WHERE "rank" = 'Safe~Guarding';

-- Moderator/Media -> Moderator
UPDATE "Staff" SET "rank" = 'Moderator' WHERE "rank" = 'Moderator/Media';
UPDATE "Staff" SET "rank" = 'Moderator' WHERE "rank" = 'Moderator / Media';

-- Ensure standard casing for existing correct values
UPDATE "Staff" SET "rank" = 'Founder' WHERE "rank" = 'founder';
UPDATE "Staff" SET "rank" = 'Admin' WHERE "rank" = 'admin';
UPDATE "Staff" SET "rank" = 'Moderator' WHERE "rank" = 'moderator';
UPDATE "Staff" SET "rank" = 'Co-Founder' WHERE "rank" = 'co-founder';
UPDATE "Staff" SET "rank" = 'Co-Owner' WHERE "rank" = 'co-owner';
UPDATE "Staff" SET "rank" = 'Safeguarding' WHERE "rank" = 'safeguarding';

-- Verify the changes
SELECT "id", "name", "vrchatUsername", "rank", "sortOrder" FROM "Staff" ORDER BY "sortOrder", "name";