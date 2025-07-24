@echo off
REM Project CRUD Demo Script for Windows
REM This script demonstrates the complete Project CRUD operations

echo 🗂️ Project CRUD Demo
echo ==================
echo.

set BASE_URL=http://localhost:3001
set EMAIL=project-demo@example.com
set PASSWORD=password123
set NAME=Project Demo User

echo Step 1: Register a new user...
curl -s -X POST "%BASE_URL%/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\",\"name\":\"%NAME%\"}" > register_response.json

echo Registration response:
type register_response.json
echo.

echo Step 2: Extract token and continue with project operations...
echo.
echo Please copy the JWT token from the response above and set it as a variable:
echo set TOKEN=your_jwt_token_here
echo.
echo Then test these Project CRUD operations:
echo.

echo === CREATE PROJECT ===
echo curl -X POST "%BASE_URL%/api/v1/projects" ^
echo   -H "Authorization: Bearer %%TOKEN%%" ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"name\":\"Hello World\",\"language\":\"javascript\",\"code\":\"console.log('Hello World!');\",\"command\":\"node index.js\"}"
echo.

echo === GET ALL PROJECTS ===
echo curl -X GET "%BASE_URL%/api/v1/projects" ^
echo   -H "Authorization: Bearer %%TOKEN%%"
echo.

echo === GET PROJECT BY ID ===
echo curl -X GET "%BASE_URL%/api/v1/projects/1" ^
echo   -H "Authorization: Bearer %%TOKEN%%"
echo.

echo === UPDATE PROJECT ===
echo curl -X PUT "%BASE_URL%/api/v1/projects/1" ^
echo   -H "Authorization: Bearer %%TOKEN%%" ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"name\":\"Updated Hello World\",\"code\":\"console.log('Hello Updated World!');\",\"isPublished\":true}"
echo.

echo === SEARCH PROJECTS ===
echo curl -X GET "%BASE_URL%/api/v1/projects?search=hello" ^
echo   -H "Authorization: Bearer %%TOKEN%%"
echo.

echo === DELETE PROJECT ===
echo curl -X DELETE "%BASE_URL%/api/v1/projects/1" ^
echo   -H "Authorization: Bearer %%TOKEN%%"
echo.

echo === GET PUBLISHED PROJECTS (PUBLIC) ===
echo curl -X GET "%BASE_URL%/api/v1/projects/published"
echo.

REM Clean up
del register_response.json

pause
