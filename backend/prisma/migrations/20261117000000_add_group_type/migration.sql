-- AlterTable: support legacy basic groups (no topics) alongside supergroups/forums
ALTER TABLE "Group" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'channel';
