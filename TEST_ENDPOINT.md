# Testing the Mini Coder API Endpoint

## Prerequisites
1. Backend is running: `cd backend && npm run dev`
2. You have a valid JWT token (get from logging in to the frontend)
3. Your `.env` file has the required variables set

## Quick Test with cURL

### 1. Get a JWT Token First
You need to log in through the frontend or use the auth endpoint:

```bash
# Login (replace with your credentials)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

This returns:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

Copy the `token` value.

### 2. Test Mini Coder Generate Endpoint

```bash
curl -X POST http://localhost:3000/ai/mini-coder/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "command": "create a simple calculator",
    "detectedLanguage": "en"
  }'
```

### Expected Response

**Success (200):**
```json
{
  "generatedCode": "<!DOCTYPE html>\n<html>...",
  "projectName": "Simple Calculator",
  "detectedLanguage": "en",
  "tokensRemaining": 8,
  "usage": {
    "promptTokens": 150,
    "completionTokens": 800,
    "totalTokens": 950
  },
  "metadata": {
    "userId": 123,
    "timestamp": "2025-01-23T10:30:00.000Z"
  }
}
```

**Error - No Auth (401):**
```json
{
  "error": "Authentication required"
}
```

**Error - Out of Tokens (403):**
```json
{
  "error": "Out of tokens",
  "tokensRequired": 2,
  "tokensAvailable": 0,
  "message": "You need 2 token(s) but only have 0"
}
```

**Error - Missing Prompts (500):**
```json
{
  "error": "Failed to generate mini app. Please try again.",
  "details": "OpenAI API Error: ...",
  "code": "GENERATION_FAILED"
}
```

## Check Your Setup

### 1. Verify Backend is Running
```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2025-01-23T10:30:00.000Z"
}
```

### 2. Check OpenAI Configuration
Look at your backend console when starting. You should see:
```
✅ OpenAI configuration validated
🤖 OpenAI integration ready
```

If you see `⚠️ OpenAI integration disabled`, then your `.env` is missing `OPENAI_API_KEY`.

### 3. Verify Environment Variables

Create a test script:

```bash
# backend/test-env.js
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('SYSTEM_PROMPT:', process.env.SYSTEM_PROMPT ? '✅ Set' : '❌ Missing');
console.log('OPENAI_FIX_INSTRUCTIONS:', process.env.OPENAI_FIX_INSTRUCTIONS ? '✅ Set' : '❌ Missing');
```

Run it:
```bash
cd backend
node -r dotenv/config test-env.js
```

### 4. Common Issues

#### "Authorization header missing"
**Problem:** No JWT token sent
**Fix:** Add `-H "Authorization: Bearer YOUR_TOKEN"`

#### "Invalid token"
**Problem:** Token expired or malformed
**Fix:** Get a fresh token by logging in again

#### "Out of tokens"
**Problem:** User has 0 tokens remaining
**Fix:** Add tokens via admin endpoint:
```bash
curl -X POST http://localhost:3000/admin/users/USER_ID/tokens \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "tokens": 10 }'
```

#### Generation returns empty or bad code
**Problem:** Prompts not loaded from `.env`
**Fix:**
1. Check `backend/.env` has `SYSTEM_PROMPT` and `OPENAI_FIX_INSTRUCTIONS`
2. Restart backend after changing `.env`
3. Verify prompts are complete (not just placeholder text)

## Testing Other Endpoints

### Test Modify Endpoint
```bash
curl -X POST http://localhost:3000/ai/mini-coder/modify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "command": "make the buttons bigger",
    "currentAppCode": "<html>...</html>",
    "currentAppName": "My Calculator",
    "detectedLanguage": "en"
  }'
```

### Test Transcribe Endpoint
```bash
# Requires multipart/form-data with audio file
curl -X POST http://localhost:3000/ai/mini-coder/transcribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@recording.webm"
```

### Test GDPR Export
```bash
curl -X GET http://localhost:3000/api/gdpr/export \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test GDPR Delete
```bash
curl -X DELETE http://localhost:3000/api/gdpr/delete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Using Postman or Insomnia

### Setup Collection
1. Create a new collection
2. Add environment variable: `baseUrl = http://localhost:3000`
3. Add environment variable: `token = YOUR_JWT_TOKEN`

### Request Template
```
POST {{baseUrl}}/ai/mini-coder/generate
Headers:
  Content-Type: application/json
  Authorization: Bearer {{token}}
Body (JSON):
{
  "command": "create a todo list app",
  "detectedLanguage": "en"
}
```

## Frontend Integration Test

If you want to test through the actual app:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm start`
3. Open browser: http://localhost:4200
4. Login with test user
5. Try creating an app
6. Open DevTools → Network tab
7. Look for request to `/ai/mini-coder/generate`
8. Check the request headers include `Authorization: Bearer ...`
9. Check the response includes `tokensRemaining`

## Debugging Tips

### Enable Verbose Logging
Add to `backend/src/services/miniCoderService.ts`:
```typescript
console.log('🔍 System Prompt:', SYSTEM_PROMPT.substring(0, 50) + '...');
console.log('🔍 Fix Instructions:', FIX_INSTRUCTIONS.substring(0, 50) + '...');
```

### Check Token Deduction
Add to `backend/src/middleware/tokenDeduction.ts`:
```typescript
console.log(`💰 User ${user.id} has ${user.tokens} tokens`);
console.log(`💸 Deducting ${tokensRequired} tokens`);
```

### Monitor OpenAI Calls
Add to `backend/src/services/miniCoderService.ts`:
```typescript
console.log('🤖 Calling OpenAI with model:', 'gpt-4o');
console.log('🤖 Max tokens:', maxTokens);
```

## Success Indicators

✅ Backend starts without errors
✅ Health check returns OK
✅ Login returns JWT token
✅ Generate endpoint returns HTML code
✅ Response includes `tokensRemaining`
✅ Token count decreases after generation
✅ Browser DevTools shows NO calls to `api.openai.com`
✅ All calls go to `localhost:3000/ai/mini-coder/*`

## Need Help?

If the endpoint isn't working:
1. Check backend console for errors
2. Verify all environment variables are set
3. Restart backend after changing `.env`
4. Check database connection is working
5. Verify user has tokens remaining
6. Check OpenAI API key is valid
7. Verify prompts are complete (not placeholders)

See `QUICK_START_SECURITY.md` for more troubleshooting steps.
