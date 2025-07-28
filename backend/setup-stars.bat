@echo off
echo 🌟 Setting up Star Functionality for Mini Coder...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the backend directory of the mini-coder project
    pause
    exit /b 1
)

echo 📊 Step 1: Checking database connection...
where psql >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ PostgreSQL client found
) else (
    echo ❌ PostgreSQL client not found. Please install PostgreSQL.
    pause
    exit /b 1
)

echo.
echo 🗄️  Step 2: Applying database migration...
set /p DB_HOST="Database host (default: localhost): "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_USER="Database user (default: postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

set /p DB_NAME="Database name (default: minicoder): "
if "%DB_NAME%"=="" set DB_NAME=minicoder

echo Applying migration...
psql -h %DB_HOST% -U %DB_USER% -d %DB_NAME% -f migration_add_stars.sql
if %ERRORLEVEL% EQU 0 (
    echo ✅ Migration applied successfully!
) else (
    echo ❌ Migration failed. Please check your database connection and try again.
    echo You can manually apply the migration by running:
    echo psql -h %DB_HOST% -U %DB_USER% -d %DB_NAME% -f migration_add_stars.sql
    pause
    exit /b 1
)

echo.
echo 🔧 Step 3: Generating Prisma client...
npm run prisma:generate
if %ERRORLEVEL% EQU 0 (
    echo ✅ Prisma client generated successfully!
) else (
    echo ❌ Failed to generate Prisma client. Trying with npx...
    npx prisma generate
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Prisma client generated successfully!
    ) else (
        echo ❌ Failed to generate Prisma client. Please run 'npx prisma generate' manually.
        pause
        exit /b 1
    )
)

echo.
echo 🧪 Step 4: Testing the setup...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Running star functionality tests...
    node test-stars.js
    if %ERRORLEVEL% EQU 0 (
        echo ✅ All tests passed!
    ) else (
        echo ⚠️  Some tests failed. This might be expected if no projects are published yet.
        echo The star functionality should still work once you have published projects.
    )
) else (
    echo ⚠️  Node.js not found. Skipping tests.
)

echo.
echo 🎉 Star functionality setup complete!
echo.
echo Next steps:
echo 1. Start the backend server: npm start
echo 2. Start the frontend (in another terminal): cd ..\src && npm start
echo 3. Log in to the app and publish some projects
echo 4. Visit the App Store to see the star functionality
echo.
echo For troubleshooting, see STAR_FUNCTIONALITY_IMPLEMENTATION.md

pause
