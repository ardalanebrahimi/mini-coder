@echo off
echo Setting up Mini Coder Backend...
echo.

echo Step 1: Installing dependencies...
npm install
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Generating Prisma client...
npx prisma generate
if errorlevel 1 (
    echo Failed to generate Prisma client
    pause
    exit /b 1
)

echo.
echo Step 3: Setting up database (make sure PostgreSQL is running)...
echo Please ensure your PostgreSQL database is running and the DATABASE_URL in .env is correct
echo Then run: npm run db:push

echo.
echo Setup complete! 
echo.
echo Next steps:
echo 1. Update .env with your PostgreSQL connection string
echo 2. Run: npm run db:push (to sync database schema)
echo 3. Run: npm run dev (to start development server)
echo.
pause
