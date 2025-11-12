# Deployment Checklist for leaderboard.1to10x.com

## ✅ Code Changes Completed

All localhost URLs have been updated to use `https://leaderboard.1to10x.com`:

### Backend Updates:
- ✅ CORS configuration updated
- ✅ OAuth callback URLs updated
- ✅ Session cookie settings configured for production
- ✅ Frontend redirect URLs updated

### Frontend Updates:
- ✅ API base URL updated in `src/lib/api.ts`
- ✅ All page components updated (Dashboard, Profile, Settings, etc.)
- ✅ AuthContext updated
- ✅ All API calls now use production domain

## 🔧 Required Environment Variables

### Backend (.env in backend/ folder)

```env
# Production Domain
NODE_ENV=production
FRONTEND_URL=https://leaderboard.1to10x.com
PORT=3001

# Google OAuth - CRITICAL: Update in Google Cloud Console
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://leaderboard.1to10x.com/api/auth/google/callback

# Session Security
SESSION_SECRET=your_secure_random_string_32_chars_minimum

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Circle.so
CIRCLE_ADMIN_API_TOKEN=your_circle_admin_api_token
```

### Frontend (.env in root folder)

```env
VITE_API_URL=https://leaderboard.1to10x.com
```

## 🔐 Google OAuth Configuration (REQUIRED)

**IMPORTANT**: You must update Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** → **Credentials**
3. Select your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://leaderboard.1to10x.com/api/auth/google/callback
   ```
5. Save changes

**Without this, OAuth login will NOT work!**

## 🌐 Domain & SSL Setup

1. **DNS Configuration**: Point `leaderboard.1to10x.com` to your server IP
2. **SSL Certificate**: Ensure HTTPS is configured (Let's Encrypt, Cloudflare, etc.)
3. **Backend Routing**: 
   - Frontend: `https://leaderboard.1to10x.com/`
   - API: `https://leaderboard.1to10x.com/api/*`

## 📋 Deployment Architecture

### Option 1: Same Domain (Recommended)
- Frontend: Served from `https://leaderboard.1to10x.com/`
- Backend API: `https://leaderboard.1to10x.com/api/*`
- OAuth Callback: `https://leaderboard.1to10x.com/api/auth/google/callback`

### Option 2: Separate API Subdomain
- Frontend: `https://leaderboard.1to10x.com/`
- Backend API: `https://api.leaderboard.1to10x.com/`
- OAuth Callback: `https://api.leaderboard.1to10x.com/api/auth/google/callback`
- **Note**: If using this, update `GOOGLE_REDIRECT_URI` and `VITE_API_URL` accordingly

## ✅ Testing Checklist

After deployment, test:
- [ ] Frontend loads at `https://leaderboard.1to10x.com`
- [ ] API endpoints respond at `https://leaderboard.1to10x.com/api/*`
- [ ] Google OAuth login works
- [ ] OAuth callback redirects correctly
- [ ] Session cookies work across page navigation
- [ ] All API calls use HTTPS
- [ ] No CORS errors in browser console

## 🚨 Common Issues

1. **OAuth not working**: Check Google Cloud Console redirect URI
2. **CORS errors**: Verify `FRONTEND_URL` in backend .env
3. **Session not persisting**: Check cookie `secure` and `sameSite` settings
4. **API 404 errors**: Verify backend is running and routes are correct

## 📝 Notes

- All URLs default to `https://leaderboard.1to10x.com` if env vars are not set
- Development localhost URLs are still supported for local testing
- Session cookies are configured for production (secure, httpOnly, sameSite: 'none')

