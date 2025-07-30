@echo off
echo Applying analytics migration...
echo.

REM Set environment variables if not already set
if not defined DATABASE_URL (
    echo Warning: DATABASE_URL not set. Using default local PostgreSQL.
    set DATABASE_URL=postgresql://postgres:password@localhost:5432/minicoder
)

echo Running analytics migration...
psql %DATABASE_URL% -f migration_add_analytics.sql

if %ERRORLEVEL% EQU 0 (
    echo ✅ Analytics migration applied successfully!
    echo.
    echo Regenerating Prisma client...
    npx prisma generate
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Prisma client regenerated successfully!
        echo.
        echo Analytics backend is now ready!
        echo - Analytics events table created
        echo - Indexes added for performance
        echo - Prisma client updated
    ) else (
        echo ❌ Failed to regenerate Prisma client
    )
) else (
    echo ❌ Failed to apply analytics migration
    echo Please check your database connection and try again.
)

pause
