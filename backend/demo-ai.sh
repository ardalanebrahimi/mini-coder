#!/bin/bash

# OpenAI Proxy Demo Script
# This script demonstrates the AI code generation endpoint

echo "🤖 OpenAI Proxy Demo"
echo "==================="
echo ""

BASE_URL="http://localhost:3001"
EMAIL="ai-demo@example.com"
PASSWORD="password123"
NAME="AI Demo User"

echo "Step 1: Register a new user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"$NAME\"}")

echo "$REGISTER_RESPONSE" | jq .

# Extract token from response
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Registration failed. Please check if the server is running."
  exit 1
fi

echo ""
echo "Step 2: Check AI service health..."
curl -s -X GET "$BASE_URL/ai/health" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "Step 3: Get available AI models..."
curl -s -X GET "$BASE_URL/ai/models" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "Step 4: Check initial token balance..."
curl -s -X GET "$BASE_URL/api/v1/tokens/balance" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "Step 5: Generate JavaScript code (costs 1 token)..."
JS_RESPONSE=$(curl -s -X POST "$BASE_URL/ai/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a function to calculate factorial of a number",
    "language": "javascript",
    "context": "Add error handling for negative numbers and non-integers"
  }')

echo "$JS_RESPONSE" | jq .

echo ""
echo "Step 6: Generate Python code (costs 1 token)..."
PY_RESPONSE=$(curl -s -X POST "$BASE_URL/ai/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a class for managing a todo list with add, remove, and list methods",
    "language": "python",
    "maxTokens": 1500,
    "temperature": 0.5
  }')

echo "$PY_RESPONSE" | jq .

echo ""
echo "Step 7: Generate HTML/CSS code (costs 1 token)..."
HTML_RESPONSE=$(curl -s -X POST "$BASE_URL/ai/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a responsive navigation bar with dropdown menu",
    "language": "html",
    "context": "Include CSS styling, mobile-friendly design, and smooth animations"
  }')

echo "$HTML_RESPONSE" | jq .

echo ""
echo "Step 8: Check token balance after generations..."
curl -s -X GET "$BASE_URL/api/v1/tokens/balance" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "Step 9: Try to generate without tokens (when balance is 0)..."
# This would normally fail when user runs out of tokens
echo "This will work if you still have tokens, otherwise you'll get a 403 error:"
curl -s -X POST "$BASE_URL/ai/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple React component",
    "language": "javascript"
  }' | jq .

echo ""
echo "✅ AI code generation demo completed!"
echo "🤖 Make sure you have a valid OpenAI API key in your .env file for this to work."
echo "🪙 Each generation request costs 1 token - users start with 100 tokens."
