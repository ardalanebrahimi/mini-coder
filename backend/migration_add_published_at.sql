-- Add publishedAt column to projects table
-- This migration adds support for tracking when a project was published

ALTER TABLE projects 
ADD COLUMN "publishedAt" TIMESTAMP;

-- Set publishedAt for already published projects to their updatedAt timestamp
UPDATE projects 
SET "publishedAt" = "updatedAt" 
WHERE "isPublished" = true;
