-- Migration to add stars functionality
-- This allows users to star/react to apps in the App Store

CREATE TABLE "stars" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stars_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better performance
CREATE INDEX "stars_userId_idx" ON "stars"("userId");
CREATE INDEX "stars_projectId_idx" ON "stars"("projectId");

-- Create unique constraint to prevent duplicate stars
CREATE UNIQUE INDEX "unique_user_project_star" ON "stars"("userId", "projectId");

-- Add foreign key constraints
ALTER TABLE "stars" ADD CONSTRAINT "stars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stars" ADD CONSTRAINT "stars_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
