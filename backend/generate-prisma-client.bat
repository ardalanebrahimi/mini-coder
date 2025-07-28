@echo off
echo Generating Prisma client with stars functionality...

REM Navigate to backend directory
cd backend

REM Generate Prisma client
npx prisma generate

if %ERRORLEVEL% EQU 0 (
    echo Prisma client generated successfully!
) else (
    echo Failed to generate Prisma client.
)

pause
