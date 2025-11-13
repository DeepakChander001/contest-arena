# Circle → Supabase → Frontend Integration

## ✅ Implementation Complete

This document describes the complete integration of Circle.so with Supabase and the frontend.

## Architecture

1. **User signs in with Google** → Frontend receives JWT credential
2. **Frontend calls `/api/auth/complete`** → Backend processes:
   - Decodes Google JWT
   - Fetches user data from Circle.so API
   - Saves/updates user in Supabase (user_profiles, user_gamification, user_activity, user_badges, user_spaces)
   - Returns complete user object
3. **Frontend saves user to localStorage** → User is authenticated
4. **Subsequent data fetches** → Frontend calls `/api/user/profile` which:
   - First checks Supabase (fast)
   - Falls back to Circle.so if not found
   - Returns formatted user data

## Files Created/Updated

### Backend API Routes (Vercel Serverless Functions)

1. **`api/auth/complete.ts`**
   - Handles Google OAuth callback
   - Fetches Circle member data
   - Saves to Supabase (all related tables)
   - Returns complete user object

2. **`api/user/profile.ts`**
   - Fetches user profile by email
   - Checks Supabase first, falls back to Circle
   - Returns formatted user data

### Frontend Updates

1. **`src/pages/Auth.tsx`**
   - Updated `handleGoogleCallback` to call `/api/auth/complete`
   - Handles Circle member validation errors
   - Saves complete user data from backend

2. **`src/lib/api.ts`**
   - Changed `baseUrl` to `/api` (relative path for Vercel)
   - Updated `getMemberData()` to call `/api/user/profile`
   - Transforms backend response to match `MemberData` interface

3. **`src/contexts/AuthContext.tsx`**
   - Updated `refreshUserData()` to use new backend endpoint
   - Fetches fresh data from Supabase/Circle

## Environment Variables Required

Add these to your **Vercel Dashboard** → **Project Settings** → **Environment Variables**:

```env
# Circle.so API
CIRCLE_API_TOKEN=your_circle_api_token_here
# OR use CIRCLE_HEADLESS_API_KEY if you prefer
CIRCLE_HEADLESS_API_KEY=your_circle_headless_api_key_here

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth (already configured)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Database Schema Requirements

Ensure your Supabase database has these tables:

1. **`user_profiles`** - Main user profile data
2. **`user_gamification`** - XP, levels, progress
3. **`user_activity`** - Posts, comments, activity scores
4. **`user_badges`** - User badges/achievements
5. **`user_spaces`** - Circle spaces/courses user is enrolled in

## API Endpoints

### `POST /api/auth/complete`
- **Body**: `{ credential: string }` (Google JWT)
- **Returns**: `{ user: UserObject }`
- **Errors**: 
  - `404` - Not a Circle member
  - `500` - Server error

### `GET /api/user/profile?email=user@example.com`
- **Returns**: User profile data
- **Errors**:
  - `400` - Email required
  - `404` - User not found
  - `500` - Server error

## Flow Diagram

```
User → Google Sign-In → JWT Credential
  ↓
Frontend → POST /api/auth/complete
  ↓
Backend → Decode JWT → Fetch Circle.so API
  ↓
Backend → Save to Supabase (all tables)
  ↓
Backend → Return complete user object
  ↓
Frontend → Save to localStorage → Redirect to /dashboard
```

## Testing

1. **Sign in with Google** - Should fetch Circle data and save to Supabase
2. **Check Supabase** - Verify user data is saved correctly
3. **Refresh dashboard** - Should load data from Supabase (fast)
4. **New user** - Should fetch from Circle and save to Supabase

## Notes

- Circle API uses `Token` authentication (not `Bearer`)
- Supabase uses `upsert` with `onConflict` for idempotent operations
- All API routes include CORS headers for cross-origin requests
- Frontend uses relative paths (`/api/*`) for Vercel serverless functions

## Troubleshooting

1. **"Not a Circle member" error**
   - User's email must exist in Circle.so community
   - Check Circle API token is correct

2. **Supabase errors**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` has correct permissions
   - Check database schema matches expected structure

3. **CORS errors**
   - All API routes include CORS headers
   - If issues persist, check Vercel configuration

