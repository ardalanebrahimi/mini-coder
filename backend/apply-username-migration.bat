@echo off
echo Applying username migration to database...

REM Load environment variables from .env file
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if "%%a"=="DATABASE_URL" set DATABASE_URL=%%b
)

REM Apply the migration using psql
psql "%DATABASE_URL%" -f migration_add_username.sql

if %ERRORLEVEL% EQU 0 (
    echo Migration applied successfully!
    echo Regenerating Prisma client...
    npx prisma generate
    echo Done!
) else (
    echo Migration failed!
    exit /b 1
)

pause
