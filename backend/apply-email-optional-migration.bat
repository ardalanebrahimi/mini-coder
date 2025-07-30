@echo off
echo Applying migration to make email optional...
psql %DATABASE_URL% -f migration_make_email_optional.sql
echo Migration applied successfully!

echo Regenerating Prisma client...
npx prisma generate
echo Prisma client regenerated!

echo Done!
