@echo off
REM OpenAI Proxy Demo Script for Windows
REM This script demonstrates the AI code generation endpoint

echo 🤖 OpenAI Proxy Demo
echo ===================
echo.

set BASE_URL=http://localhost:3001
set EMAIL=ai-demo@example.com
set PASSWORD=password123
set NAME=AI Demo User

echo Step 1: Register a new user...
curl -s -X POST "%BASE_URL%/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\",\"name\":\"%NAME%\"}" > register_response.json

echo Registration response:
type register_response.json
echo.

echo Step 2: Extract token and test AI endpoints...
echo.
echo Please copy the JWT token from the response above and set it as a variable:
echo set TOKEN=your_jwt_token_here
echo.
echo Then test these AI endpoints:
echo.

echo === CHECK AI HEALTH ===
echo curl -X GET "%BASE_URL%/ai/health" ^
echo   -H "Authorization: Bearer %%TOKEN%%"
echo.

echo === GET AVAILABLE MODELS ===
echo curl -X GET "%BASE_URL%/ai/models" ^
echo   -H "Authorization: Bearer %%TOKEN%%"
echo.

echo === GENERATE JAVASCRIPT CODE ===
echo curl -X POST "%BASE_URL%/ai/generate" ^
echo   -H "Authorization: Bearer %%TOKEN%%" ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"prompt\":\"Create a function to calculate factorial\",\"language\":\"javascript\",\"context\":\"Add error handling and comments\"}"
echo.

echo === GENERATE PYTHON CODE ===
echo curl -X POST "%BASE_URL%/ai/generate" ^
echo   -H "Authorization: Bearer %%TOKEN%%" ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"prompt\":\"Create a class for managing a todo list\",\"language\":\"python\",\"maxTokens\":1500}"
echo.

echo === GENERATE HTML/CSS ===
echo curl -X POST "%BASE_URL%/ai/generate" ^
echo   -H "Authorization: Bearer %%TOKEN%%" ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"prompt\":\"Create a responsive navigation bar\",\"language\":\"html\",\"context\":\"Include CSS styling and mobile-friendly design\"}"
echo.

echo === CHECK TOKEN BALANCE AFTER GENERATIONS ===
echo curl -X GET "%BASE_URL%/api/v1/tokens/balance" ^
echo   -H "Authorization: Bearer %%TOKEN%%"
echo.

echo Note: Each AI generation request deducts 1 token from your account.
echo Make sure you have OpenAI API key configured in your .env file!
echo.

REM Clean up
del register_response.json

pause
