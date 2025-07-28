@echo off
echo Applying stars migration...

REM Navigate to backend directory
cd backend

REM Apply the migration
psql -h localhost -U postgres -d minicoder -f migration_add_stars.sql

if %ERRORLEVEL% EQU 0 (
    echo Migration applied successfully!
) else (
    echo Failed to apply migration.
    echo Please check your database connection and try again.
)

pause
