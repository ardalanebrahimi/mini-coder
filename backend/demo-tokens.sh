#!/bin/bash

# Token Deduction Demo Script
# This script demonstrates the token-based access control system

echo "🪙 Token Deduction Middleware Demo"
echo "=================================="
echo ""

BASE_URL="http://localhost:3001"
EMAIL="demo@example.com"
PASSWORD="password123"
NAME="Demo User"

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
echo "Step 2: Check initial token balance (should be 100)..."
curl -s -X GET "$BASE_URL/api/v1/tokens/balance" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "Step 3: Preview prompt generation (no tokens deducted)..."
curl -s -X POST "$BASE_URL/api/v1/prompts/preview" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input":"Write a story about robots","type":"basic"}' | jq .

echo ""
echo "Step 4: Generate prompt (will deduct 1 token)..."
curl -s -X POST "$BASE_URL/api/v1/prompts/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input":"Write a story about robots","type":"basic"}' | jq .

echo ""
echo "Step 5: Check token balance after generation (should be 99)..."
curl -s -X GET "$BASE_URL/api/v1/tokens/balance" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "Step 6: Generate a few more prompts to see token deduction..."
for i in {1..3}; do
  echo "Generating prompt #$i..."
  curl -s -X POST "$BASE_URL/api/v1/prompts/generate" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"input\":\"Prompt number $i\",\"type\":\"basic\"}" | jq '.tokensRemaining'
done

echo ""
echo "Step 7: Final token balance check..."
curl -s -X GET "$BASE_URL/api/v1/tokens/balance" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "✅ Demo completed! The token deduction system is working correctly."
echo "💡 Try calling the generate endpoint when you have 0 tokens to see the 403 error."
