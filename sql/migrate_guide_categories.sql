-- Update existing guides with new enum values
UPDATE "Guide" SET "category" = 'GENERAL' WHERE "category" IN ('General', 'Technical');
UPDATE "Guide" SET "category" = 'GETTING_STARTED' WHERE "category" = 'Getting Started';
UPDATE "Guide" SET "category" = 'VRCHAT' WHERE "category" = 'VRChat';
UPDATE "Guide" SET "category" = 'COMMUNITY' WHERE "category" = 'Community';
UPDATE "Guide" SET "category" = 'EVENTS' WHERE "category" = 'Events';
UPDATE "Guide" SET "category" = 'ACCOUNTS' WHERE "category" = 'Accounts';
UPDATE "Guide" SET "category" = 'SAFETY' WHERE "category" = 'Safety';
UPDATE "Guide" SET "category" = 'WEBSITE' WHERE "category" = 'Website';
UPDATE "Guide" SET "category" = 'ACCESSIBILITY' WHERE "category" = 'Accessibility';
UPDATE "Guide" SET "category" = 'REPORTS' WHERE "category" = 'Reports';
UPDATE "Guide" SET "category" = 'SUPPORT' WHERE "category" = 'Support';
UPDATE "Guide" SET "category" = 'STAFF' WHERE "category" = 'Staff';
UPDATE "Guide" SET "category" = 'DISCORD_SERVER' WHERE "category" = 'Discord Sever';
UPDATE "Guide" SET "category" = 'GENERAL' WHERE "category" NOT IN ('GETTING_STARTED', 'VRCHAT', 'EVENTS', 'COMMUNITY', 'REPORTS', 'ACCOUNTS', 'SAFETY', 'WEBSITE', 'ACCESSIBILITY', 'GENERAL', 'SUPPORT', 'STAFF', 'DISCORD_SERVER');