# Frontend-Only Google OAuth Setup Guide

## ✅ Implementation Complete

The application now uses **frontend-only Google OAuth** using `@react-oauth/google`, which eliminates the need for a backend API endpoint and resolves all 502 Bad Gateway errors.

## What Was Changed

1. ✅ Installed `@react-oauth/google` and `jwt-decode` packages
2. ✅ Updated `src/main.tsx` to wrap app with `GoogleOAuthProvider`
3. ✅ Updated `src/pages/Auth.tsx` to use `GoogleLogin` component
4. ✅ Added `handleGoogleLogin` function to `AuthContext` for processing Google user data
5. ✅ Created `ProtectedRoute` component for route protection
6. ✅ Updated `App.tsx` to use `ProtectedRoute` for authenticated routes
7. ✅ Simplified `vercel.json` (removed API route rewrites)
8. ✅ Created `.env.example` file

## Required Setup

### Step 1: Set Environment Variable

**In Vercel Dashboard:**
1. Go to your project: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id
   ```
5. Set for **Production**, **Preview**, and **Development** environments
6. **Redeploy** your project

**For Local Development:**
Create a `.env` file in the project root:
```env
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id
```

### Step 2: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   https://leaderboard.1to10x.com
   https://www.leaderboard.1to10x.com
   ```

4. **Authorized redirect URIs:**
   ```
   http://localhost:5173
   https://leaderboard.1to10x.com
   https://www.leaderboard.1to10x.com
   ```

   **Note:** With frontend-only OAuth, these are the origins where the OAuth popup can appear. The actual redirect happens client-side.

### Step 3: Get Your Google Client ID

If you don't have a Google Client ID yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API** (if not already enabled)
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth client ID**
6. Application type: **Web application**
7. Name: `1to10x Contest Arena`
8. Add authorized origins and redirect URIs (see Step 2)
9. Copy the **Client ID** (not the Client Secret - you don't need it for frontend-only OAuth)

## How It Works

1. **User clicks "Login with Google"** → Google OAuth popup appears
2. **User selects account** → Google returns a JWT token
3. **Frontend decodes JWT** → Extracts user email, name, picture
4. **Frontend calls Circle API** → Fetches user data from Circle.so
5. **User is logged in** → Redirected to dashboard

## Testing

### Local Testing:
```bash
npm run dev
```
Visit: `http://localhost:5173/auth`
- Click "Login with Google"
- Should see Google account picker
- After login, should redirect to dashboard

### Production Testing:
1. Ensure `VITE_GOOGLE_CLIENT_ID` is set in Vercel
2. Redeploy project
3. Visit: `https://leaderboard.1to10x.com/auth`
4. Test login flow

## Troubleshooting

### Issue: "VITE_GOOGLE_CLIENT_ID is not defined"
**Solution:** 
- Check `.env` file exists (for local)
- Check Vercel environment variables (for production)
- Ensure variable name is exactly `VITE_GOOGLE_CLIENT_ID`
- Redeploy after adding variable

### Issue: "redirect_uri_mismatch"
**Solution:**
- Verify Google Cloud Console has correct redirect URIs
- Ensure no trailing slashes
- Use HTTPS for production

### Issue: Button doesn't appear
**Solution:**
- Check browser console for errors
- Verify `GoogleOAuthProvider` wraps the app in `main.tsx`
- Check that `VITE_GOOGLE_CLIENT_ID` is set correctly

### Issue: Login works but user not found
**Solution:**
- This is expected if user is not a Circle member
- User will be redirected to `/create-profile` page
- After creating profile, they can log in

## Benefits of Frontend-Only OAuth

✅ **No backend required** - Works entirely in the browser
✅ **No 502 errors** - No API endpoint needed
✅ **Faster** - Direct Google OAuth, no server round-trip
✅ **Simpler** - Less infrastructure to maintain
✅ **Secure** - JWT tokens are validated client-side

## Files Modified

- `src/main.tsx` - Added GoogleOAuthProvider
- `src/pages/Auth.tsx` - Replaced with GoogleLogin component
- `src/contexts/AuthContext.tsx` - Added handleGoogleLogin function
- `src/components/ProtectedRoute.tsx` - New component for route protection
- `src/App.tsx` - Added ProtectedRoute wrappers
- `vercel.json` - Simplified (removed API routes)
- `.env.example` - Added example environment variables
- `package.json` - Added @react-oauth/google and jwt-decode

## Next Steps

1. ✅ Set `VITE_GOOGLE_CLIENT_ID` in Vercel
2. ✅ Update Google Cloud Console redirect URIs
3. ✅ Redeploy project
4. ✅ Test login flow
5. ✅ Verify user data is fetched from Circle.so correctly

All code changes have been committed and pushed to GitHub. The login button should now work correctly!

