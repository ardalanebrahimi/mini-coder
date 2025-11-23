# 🚀 Quick Start Guide - Security Fixes

## ⚡ TL;DR - What Changed?

**Before:** OpenAI API key exposed in frontend ❌
**After:** Secure backend proxy with token system ✅

## 📋 Setup in 5 Steps

### 1. Backend Environment Setup (5 min)
```bash
cd backend
cp .env.example .env
nano .env  # or use your editor
```

Add these **REQUIRED** variables:
```bash
OPENAI_API_KEY=sk-proj-your-actual-key-here
SYSTEM_PROMPT="[Your system prompt here]"
OPENAI_FIX_INSTRUCTIONS="[Your fix instructions here]"
```

💡 See `SETUP_PROMPTS.md` for full prompt text examples.

### 2. Install Backend Dependencies (if needed)
```bash
cd backend
npm install
```

### 3. Start Backend
```bash
cd backend
npm run dev
```

Look for: `✅ OpenAI configuration validated`

### 4. Update Frontend Config
```bash
cd src/environments
# Edit environment.ts - ensure apiUrl points to your backend
```

Should look like:
```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000",
  googleClientId: "your-google-client-id",
  // No openaiApiKey - removed for security!
};
```

### 5. Start Frontend
```bash
npm start
```

## ✅ Verify It Works

### Test App Generation
1. Log in to the app
2. Try creating a simple app: "make a calculator"
3. Check browser DevTools → Network tab
4. Should see request to `http://localhost:3000/ai/mini-coder/generate` (not openai.com)

### Test Voice Input
1. Click microphone icon
2. Speak a command
3. Check Network tab → should call `/ai/mini-coder/transcribe`

## 🔐 Security Checklist

- [ ] `backend/.env` file exists and has prompts
- [ ] `backend/.env` is in `.gitignore` (don't commit it!)
- [ ] Frontend `environment.ts` has NO `openaiApiKey`
- [ ] Backend starts without errors
- [ ] App generation works through backend
- [ ] Voice transcription works through backend
- [ ] Browser DevTools shows NO calls to `api.openai.com`

## 🚨 Common Issues

### "No OpenAI API key configured"
**Fix:** Add `OPENAI_API_KEY` to `backend/.env`

### "Generation fails silently"
**Fix:** Check backend logs for errors. Likely missing prompts in `.env`

### Frontend shows "Authentication required"
**Fix:** Make sure you're logged in. AI endpoints require JWT token.

### "Out of tokens" error
**Fix:** This is expected! Add tokens via admin endpoint or adjust default tokens.

## 📁 What Files Changed?

### Backend (New Files)
- `backend/src/services/miniCoderService.ts` - AI operations handler
- `backend/src/controllers/miniCoderController.ts` - API endpoints
- `backend/src/routes/miniCoderRoutes.ts` - Route definitions
- `backend/src/controllers/gdprController.ts` - Data rights
- `backend/src/routes/gdprRoutes.ts` - GDPR endpoints
- `backend/.env.example` - Template with prompts section

### Frontend (Modified Files)
- `src/app/services/prompt-processor.service.ts` - Now calls backend
- `src/app/services/whisper-voice.service.ts` - Now calls backend
- `src/environments/environment.ts` - Removed API key
- `src/environments/environment.prod.ts` - Removed API key

### Frontend (New Files)
- `src/app/shared/parental-consent-modal.component.ts` - COPPA
- `src/app/shared/cookie-consent-banner.component.ts` - GDPR
- `src/app/legal/terms-of-service.component.ts` - Legal
- `src/app/legal/privacy-policy.component.ts` - Legal

## 🔄 API Endpoint Changes

### New Endpoints (All require JWT auth)
```
POST /ai/mini-coder/generate        # Generate app (2 tokens)
POST /ai/mini-coder/modify          # Modify app (2 tokens)
POST /ai/mini-coder/transcribe      # Voice to text (1 token)
GET  /api/gdpr/export               # Export user data
DELETE /api/gdpr/delete             # Delete account
POST /api/gdpr/consent              # Record consent
```

### Response Format Changed
**Before:** Direct OpenAI response
**After:** Includes `tokensRemaining` field

Example:
```json
{
  "generatedCode": "<html>...",
  "projectName": "Cool Calculator",
  "detectedLanguage": "en",
  "tokensRemaining": 8,
  "usage": { "totalTokens": 1234 }
}
```

## 💰 Token Costs

| Operation | Cost | Notes |
|-----------|------|-------|
| Generate new app | 2 tokens | Includes app name generation |
| Modify existing app | 2 tokens | Uses code minification |
| Voice transcription | 1 token | Whisper API |
| Voice commands (future) | 1 token | Per command |

## 📞 Need Help?

1. **Check logs:**
   - Backend: Console where you ran `npm run dev`
   - Frontend: Browser DevTools → Console

2. **Read detailed docs:**
   - `SECURITY_COMPLIANCE_FIXES.md` - Complete guide
   - `SETUP_PROMPTS.md` - Prompt setup details
   - `CHANGELOG_SECURITY.md` - What changed

3. **Still stuck?**
   - Check `.env` file syntax
   - Verify prompts don't have syntax errors
   - Restart backend after changing `.env`
   - Clear browser cache and re-login

## 🎯 Production Deployment

### Azure (example)
```bash
# Set environment variables
az webapp config appsettings set \
  --name your-app-name \
  --resource-group your-rg \
  --settings \
  OPENAI_API_KEY="sk-proj-..." \
  SYSTEM_PROMPT="[your prompt]" \
  OPENAI_FIX_INSTRUCTIONS="[your instructions]"
```

### Important for Production
- Use separate OpenAI API key for prod
- Set `NODE_ENV=production`
- Enable HTTPS
- Set up monitoring for token usage
- Configure CORS properly

## 🎉 You're Done!

Your app is now secure with:
- ✅ No exposed API keys
- ✅ Backend-only AI operations
- ✅ Token-based cost control
- ✅ COPPA & GDPR compliance ready
- ✅ Legal documents in place

Test everything, then deploy with confidence! 🚀
