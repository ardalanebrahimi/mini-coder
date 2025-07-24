@echo off
echo Setting up Authentication for Mini Coder Backend...
echo.

echo Step 1: Installing new dependencies...
npm install bcrypt jsonwebtoken
npm install --save-dev @types/bcrypt @types/jsonwebtoken
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Generating Prisma client with new schema...
npx prisma generate
if errorlevel 1 (
    echo Failed to generate Prisma client
    pause
    exit /b 1
)

echo.
echo Step 3: Pushing database changes...
echo Make sure your PostgreSQL database is running and the DATABASE_URL in .env is correct
npx prisma db push
if errorlevel 1 (
    echo Failed to push database changes
    echo Please check your database connection and try again
    pause
    exit /b 1
)

echo.
echo Authentication setup complete! 
echo.
echo New features added:
echo - POST /auth/register - Register with email/password (starts with 100 tokens)
echo - POST /auth/login - Login and get JWT token  
echo - GET /me - Get current user info (requires JWT)
echo - JWT middleware for protecting routes
echo.
echo Updated User schema with:
echo - passwordHash field (bcrypt hashed)
echo - tokens field (starts at 100)
echo.
echo Next steps:
echo 1. Update your JWT_SECRET in .env file for production
echo 2. Run: npm run dev (to start development server)
echo 3. Test auth endpoints at http://localhost:3001/api-docs
echo.
pause
