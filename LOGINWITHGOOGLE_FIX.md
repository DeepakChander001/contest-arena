# Fix: "loginWithGoogle is not defined" Error

## ✅ Issue Resolved

The error `loginWithGoogle is not defined` was caused by components trying to call a deprecated function. All instances have been fixed.

## 🔍 What Was Found

### Remaining References (All Fixed)

1. **Landing Page - Hero Section** ✅
   - Line 192: "Join the Arena" button
   - **Fixed**: Changed to `navigate('/auth')`

2. **Landing Page - CTA Section** ✅
   - Line 622: "Join with Google" button  
   - **Fixed**: Changed to `navigate('/auth')`

3. **Navbar** ✅
   - Line 130: Login button
   - **Fixed**: Changed to `navigate('/auth')`

### Valid References (No Action Needed)

The following references in `src/contexts/AuthContext.tsx` are **intentional** and **correct**:

1. **Line 41**: Type definition in `AuthContextType` interface
   ```typescript
   loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
   ```

2. **Line 435**: Implementation (deprecated, returns message)
   ```typescript
   const loginWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
     return {
       success: false,
       message: 'Please use the Google Login button on the auth page.',
     };
   };
   ```

3. **Line 572**: Exported in context value (for backward compatibility)

These are kept for backward compatibility but should not be called directly. All components now navigate to `/auth` instead.

## 🛠️ Changes Made

### File: `src/pages/Landing.tsx`

**Before:**
```typescript
<button onClick={loginWithGoogle}>
  Join the Arena
</button>
```

**After:**
```typescript
<button onClick={() => navigate('/auth')}>
  Join the Arena
</button>
```

**Also fixed:**
```typescript
// Line 622 - "Join with Google" button in CTA section
<button onClick={() => navigate('/auth')}>
  Join with Google
</button>
```

### File: `src/components/Navbar.tsx`

**Before:**
```typescript
<button onClick={loginWithGoogle}>
  Login
</button>
```

**After:**
```typescript
<button onClick={() => navigate('/auth')}>
  Login
</button>
```

## ✅ Current Authentication Flow

1. **User clicks any login button** → Navigates to `/auth`
2. **User clicks "Sign in with Google" on `/auth` page** → `useGoogleLogin` hook triggers OAuth
3. **Google OAuth popup opens** → User selects account
4. **Frontend receives token** → Fetches user info from Google
5. **AuthContext processes login** → Fetches Circle.so data
6. **Redirects to dashboard or create-profile** → Based on Circle membership

## 🧪 Verification

All instances of `loginWithGoogle` being called have been replaced with navigation to `/auth`:

```bash
# Search for any remaining direct calls (should only find type definitions)
grep -r "onClick.*loginWithGoogle" src/
grep -r "loginWithGoogle()" src/
```

**Expected Result**: No matches (except in AuthContext type definitions)

## 📝 Notes

- The `loginWithGoogle` function still exists in `AuthContext` for backward compatibility
- It returns a message directing users to the auth page
- All UI components now use `navigate('/auth')` instead
- The actual OAuth flow is handled by `useGoogleLogin` hook in `src/pages/Auth.tsx`

## 🚀 Next Steps

1. **Test the fix**:
   - Click "Login" in Navbar → Should navigate to `/auth`
   - Click "Join the Arena" on landing page → Should navigate to `/auth`
   - Click "Join with Google" in CTA section → Should navigate to `/auth`
   - All should work without errors

2. **Verify OAuth**:
   - On `/auth` page, click "Sign in with Google"
   - Should open Google OAuth popup
   - Complete login → Should redirect to dashboard

3. **Check console**:
   - No `loginWithGoogle is not defined` errors
   - No undefined function errors

## ✅ Status

**All issues fixed!** The error should no longer occur.

