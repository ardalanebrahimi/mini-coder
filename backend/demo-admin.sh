#!/bin/bash

# Admin Access Demo Script
# This script demonstrates the admin endpoint functionality

echo "🔐 Admin Access Demo"
echo "=================="
echo ""

BASE_URL="http://localhost:3001"
REGULAR_EMAIL="user@example.com"
ADMIN_EMAIL="admin@example.com"
PASSWORD="password123"

echo "Step 1: Register a regular user..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$REGULAR_EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Regular User\"}" | jq .

echo ""
echo "Step 2: Register an admin user (must match ADMIN_EMAIL env var)..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Admin User\"}" | jq .

echo ""
echo "Step 3: Login as regular user..."
REGULAR_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$REGULAR_EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r ".token")

echo "Regular user token: $REGULAR_TOKEN"

echo ""
echo "Step 4: Login as admin user..."
ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r ".token")

echo "Admin user token: $ADMIN_TOKEN"

echo ""
echo "Step 5: Try to access admin endpoint as regular user (should fail)..."
curl -s -X GET "$BASE_URL/admin" \
  -H "Authorization: Bearer $REGULAR_TOKEN" | jq .

echo ""
echo "Step 6: Access admin endpoint as admin user (should succeed)..."
curl -s -X GET "$BASE_URL/admin" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

echo ""
echo "Step 7: Create some sample projects to see stats change..."
curl -s -X POST "$BASE_URL/api/v1/projects" \
  -H "Authorization: Bearer $REGULAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Sample Project 1\",\"command\":\"create a calculator\",\"language\":\"javascript\",\"code\":\"console.log('hello')\"}" | jq .

curl -s -X POST "$BASE_URL/api/v1/projects" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Sample Project 2\",\"command\":\"create a todo app\",\"language\":\"python\",\"code\":\"print('todo')\"}" | jq .

echo ""
echo "Step 8: Check admin stats again to see updated counts..."
curl -s -X GET "$BASE_URL/admin" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

echo ""
echo "✅ Admin demo completed!"
echo "👤 Regular users get 403 Forbidden when accessing /admin"
echo "🔑 Admin users (matching ADMIN_EMAIL env var) can access admin statistics"
echo "📊 Statistics include user count, project count, and token usage"
echo ""
echo "Note: Make sure to set ADMIN_EMAIL environment variable to match the admin user's email"
echo "Example: export ADMIN_EMAIL=admin@example.com"
