# Final OAuth Login Fix - Complete Solution

## Problem Summary
The "Login with Google" button is not working. The API endpoint `/api/auth/google/url` is returning HTML instead of JSON, causing the login to fail.

## Root Causes Identified
1. ✅ **FIXED**: `express.static()` was intercepting API routes
2. ✅ **FIXED**: Added better error handling and logging
3. ✅ **FIXED**: Ensured API routes are processed before static file serving

## Complete Solution

### 1. Backend Environment Variables (`backend/.env`)

**CRITICAL - These must be set exactly:**

```env
# Google OAuth - REQUIRED
GOOGLE_CLIENT_ID=your_actual_client_id_from_gcp
GOOGLE_CLIENT_SECRET=your_actual_client_secret_from_gcp
GOOGLE_REDIRECT_URI=https://leaderboard.1to10x.com/api/auth/google/callback

# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://leaderboard.1to10x.com

# Session
SESSION_SECRET=your_secure_random_string_32_chars_minimum

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Circle.so
CIRCLE_ADMIN_API_TOKEN=your_circle_admin_api_token
```

### 2. Frontend Environment Variables (root `.env`)

```env
VITE_API_URL=https://leaderboard.1to10x.com
```

### 3. Google Cloud Platform Configuration

**Go to:** https://console.cloud.google.com/apis/credentials

**For your OAuth 2.0 Client ID, set:**

**Authorized JavaScript origins:**
```
https://leaderboard.1to10x.com
```

**Authorized redirect URIs:**
```
https://leaderboard.1to10x.com/api/auth/google/callback
```

⚠️ **IMPORTANT**: 
- No trailing slashes
- Must use `https://` (not `http://`)
- Must match EXACTLY

### 4. Testing Steps

1. **Check Backend is Running:**
   ```bash
   curl https://leaderboard.1to10x.com/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test OAuth Endpoint:**
   ```bash
   curl https://leaderboard.1to10x.com/api/auth/google/url
   ```
   Should return JSON: `{"url":"https://accounts.google.com/..."}`

3. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Click "Login with Google" button
   - Look for logs starting with 🔐, 📡, ✅, or ❌

4. **Check Network Tab:**
   - Open Network tab in DevTools
   - Click "Login with Google" button
   - Find the request to `/api/auth/google/url`
   - Check:
     - Status should be `200`
     - Response should be JSON (not HTML)
     - Content-Type should be `application/json`

### 5. Common Issues & Solutions

#### Issue: "Unexpected token '<', "<!doctype "... is not valid JSON"
**Cause**: API endpoint returning HTML instead of JSON
**Solution**: 
- ✅ Already fixed in code - API routes now skip static file serving
- Restart backend server after code update
- Verify `NODE_ENV=production` in backend `.env`

#### Issue: "Google OAuth not configured"
**Cause**: Missing or invalid `GOOGLE_CLIENT_ID`
**Solution**:
- Check `backend/.env` has `GOOGLE_CLIENT_ID` set
- Value should NOT be `your_google_client_id_here`
- Restart backend after updating `.env`

#### Issue: "redirect_uri_mismatch"
**Cause**: GCP redirect URI doesn't match
**Solution**:
- Verify GCP has: `https://leaderboard.1to10x.com/api/auth/google/callback`
- Check `backend/.env` has: `GOOGLE_REDIRECT_URI=https://leaderboard.1to10x.com/api/auth/google/callback`
- Must match EXACTLY (no trailing slash, must be HTTPS)

#### Issue: CORS Error
**Cause**: Frontend URL not in CORS allowed origins
**Solution**:
- Verify `FRONTEND_URL=https://leaderboard.1to10x.com` in backend `.env`
- Restart backend

### 6. Deployment Checklist

- [ ] Backend `.env` file has all required variables
- [ ] Frontend `.env` file has `VITE_API_URL`
- [ ] GCP OAuth credentials configured correctly
- [ ] Backend server is running
- [ ] Backend is accessible at `https://leaderboard.1to10x.com/api/*`
- [ ] SSL certificate is valid (HTTPS working)
- [ ] Test `/api/health` endpoint returns JSON
- [ ] Test `/api/auth/google/url` endpoint returns JSON
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls

### 7. Debugging Commands

**Test API endpoint directly:**
```bash
# Should return JSON with OAuth URL
curl -v https://leaderboard.1to10x.com/api/auth/google/url
```

**Check if backend is serving HTML:**
```bash
# Should return JSON, NOT HTML
curl -H "Accept: application/json" https://leaderboard.1to10x.com/api/auth/google/url
```

**Check environment variables (on server):**
```bash
cd backend
cat .env | grep GOOGLE
```

### 8. Code Changes Made

✅ **backend/server.ts**:
- Fixed static file serving to skip `/api/*` routes
- Added CORS configuration improvements
- Added logging for debugging

✅ **backend/google-auth.ts**:
- Added detailed logging
- Improved error messages
- Ensured JSON content-type header

✅ **src/contexts/AuthContext.tsx**:
- Added comprehensive error handling
- Added detailed console logging
- Better error messages for debugging

## Final Steps

1. **Update `.env` files** with correct values
2. **Restart backend server**
3. **Rebuild frontend** (if needed): `npm run build`
4. **Test login button** and check browser console
5. **Verify GCP configuration** matches exactly

## Success Indicators

When working correctly, you should see in browser console:
```
🔐 Attempting Google OAuth login...
📡 API URL: https://leaderboard.1to10x.com
📡 Endpoint: https://leaderboard.1to10x.com/api/auth/google/url
📥 Response status: 200
✅ OAuth URL received: URL present
🔄 Redirecting to Google OAuth...
```

Then you should be redirected to Google login page.

