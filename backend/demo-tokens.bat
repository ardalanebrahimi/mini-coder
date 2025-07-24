@echo off
REM Token Deduction Demo Script for Windows
REM This script demonstrates the token-based access control system

echo 🪙 Token Deduction Middleware Demo
echo ==================================
echo.

set BASE_URL=http://localhost:3001
set EMAIL=demo@example.com
set PASSWORD=password123
set NAME=Demo User

echo Step 1: Register a new user...
curl -s -X POST "%BASE_URL%/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\",\"name\":\"%NAME%\"}" > register_response.json

echo Registration response:
type register_response.json
echo.

REM Note: Windows batch doesn't have jq, so we'll show raw JSON
REM In a real scenario, you'd parse this to extract the token

echo.
echo Step 2: To continue the demo, copy the token from above and set it manually:
echo set TOKEN=your_jwt_token_here
echo.
echo Then run these commands:
echo.
echo Check token balance:
echo curl -X GET "%BASE_URL%/api/v1/tokens/balance" -H "Authorization: Bearer %%TOKEN%%"
echo.
echo Preview prompt:
echo curl -X POST "%BASE_URL%/api/v1/prompts/preview" -H "Authorization: Bearer %%TOKEN%%" -H "Content-Type: application/json" -d "{\"input\":\"Write a story\",\"type\":\"basic\"}"
echo.
echo Generate prompt (deducts token):
echo curl -X POST "%BASE_URL%/api/v1/prompts/generate" -H "Authorization: Bearer %%TOKEN%%" -H "Content-Type: application/json" -d "{\"input\":\"Write a story\",\"type\":\"basic\"}"
echo.

REM Clean up
del register_response.json

pause
