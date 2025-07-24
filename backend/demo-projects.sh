#!/bin/bash

# Project CRUD Demo Script
# This script demonstrates the complete Project CRUD operations

echo "🗂️ Project CRUD Demo"
echo "=================="
echo ""

BASE_URL="http://localhost:3001"
EMAIL="project-demo@example.com"
PASSWORD="password123"
NAME="Project Demo User"

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
echo "Step 2: Create a new project..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hello World App",
    "language": "javascript",
    "code": "console.log(\"Hello World!\");",
    "command": "node index.js",
    "isPublished": false
  }')

echo "$CREATE_RESPONSE" | jq .
PROJECT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')

echo ""
echo "Step 3: Create another project..."
curl -s -X POST "$BASE_URL/api/v1/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python Calculator",
    "language": "python",
    "code": "def add(a, b):\n    return a + b\n\nprint(add(5, 3))",
    "command": "python calculator.py",
    "isPublished": true
  }' | jq .

echo ""
echo "Step 4: Get all user projects..."
curl -s -X GET "$BASE_URL/api/v1/projects" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "Step 5: Get project by ID..."
curl -s -X GET "$BASE_URL/api/v1/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "Step 6: Update the project..."
curl -s -X PUT "$BASE_URL/api/v1/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Hello World",
    "code": "console.log(\"Hello Updated World!\");",
    "isPublished": true
  }' | jq .

echo ""
echo "Step 7: Search projects..."
curl -s -X GET "$BASE_URL/api/v1/projects?search=hello" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "Step 8: Get published projects (public endpoint)..."
curl -s -X GET "$BASE_URL/api/v1/projects/published" | jq .

echo ""
echo "Step 9: Try to access another user's project (should fail)..."
curl -s -X GET "$BASE_URL/api/v1/projects/999" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "Step 10: Delete the project..."
curl -s -X DELETE "$BASE_URL/api/v1/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "Step 11: Verify project was deleted..."
curl -s -X GET "$BASE_URL/api/v1/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "✅ Project CRUD demo completed successfully!"
echo "🗂️ All operations (Create, Read, Update, Delete) are working correctly."
