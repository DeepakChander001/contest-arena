# Google OAuth Setup Guide for leaderboard.1to10x.com

## ⚠️ CRITICAL: GCP Callback URL Configuration

### Required Callback URL for Google Cloud Platform:

```
https://leaderboard.1to10x.com/api/auth/google/callback
```

## Step-by-Step Setup Instructions

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 2. Select or Create a Project
- If you don't have a project, click "Create Project"
- Give it a name (e.g., "1to10x Contest Arena")
- Click "Create"

### 3. Enable Google+ API
- Go to **APIs & Services** → **Library**
- Search for "Google+ API" or "Google Identity"
- Click on it and click **Enable**

### 4. Create OAuth 2.0 Credentials
- Go to **APIs & Services** → **Credentials**
- Click **+ CREATE CREDENTIALS** → **OAuth client ID**
- If prompted, configure the OAuth consent screen first:
  - Choose **External** (unless you have a Google Workspace)
  - Fill in required fields:
    - App name: `1to10x Contest Arena`
    - User support email: Your email
    - Developer contact: Your email
  - Click **Save and Continue**
  - Add scopes: `email`, `profile`, `openid`
  - Click **Save and Continue**
  - Add test users if needed
  - Click **Save and Continue**

### 5. Create OAuth Client ID
- Application type: **Web application**
- Name: `1to10x Contest Arena Web Client`
- **Authorized JavaScript origins:**
  ```
  https://leaderboard.1to10x.com
  ```
- **Authorized redirect URIs (CRITICAL):**
  ```
  https://leaderboard.1to10x.com/api/auth/google/callback
  ```
- Click **Create**

### 6. Copy Credentials
- You'll see a popup with:
  - **Client ID** (copy this)
  - **Client Secret** (copy this - you won't see it again!)
- Save these securely

### 7. Add to Backend .env File
Create or update `backend/.env`:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://leaderboard.1to10x.com/api/auth/google/callback
FRONTEND_URL=https://leaderboard.1to10x.com
NODE_ENV=production
```

### 8. Verify Configuration
- ✅ Client ID is set
- ✅ Client Secret is set
- ✅ Redirect URI matches exactly: `https://leaderboard.1to10x.com/api/auth/google/callback`
- ✅ Frontend URL is set: `https://leaderboard.1to10x.com`

## Testing

1. **Test Login Button:**
   - Go to: `https://leaderboard.1to10x.com`
   - Click "Join the Arena" or "Login" button
   - Should redirect to Google login

2. **Test OAuth Flow:**
   - After Google login, should redirect back to your site
   - Should land on dashboard or create-profile page

## Common Issues

### Issue: "redirect_uri_mismatch" Error
**Solution:** 
- Check that the redirect URI in GCP matches EXACTLY:
  - Must be: `https://leaderboard.1to10x.com/api/auth/google/callback`
  - No trailing slashes
  - Must use `https://` (not `http://`)

### Issue: 404 Error on /auth
**Solution:**
- Ensure frontend is deployed and routing is configured
- Check that React Router is set up correctly
- Verify the route exists in `src/App.tsx`

### Issue: Login Button Not Working
**Solution:**
- Check browser console for errors
- Verify `VITE_API_URL` is set in frontend `.env`
- Ensure backend is running and accessible
- Check CORS configuration in backend

## Production Checklist

- [ ] OAuth credentials created in GCP
- [ ] Redirect URI added: `https://leaderboard.1to10x.com/api/auth/google/callback`
- [ ] JavaScript origin added: `https://leaderboard.1to10x.com`
- [ ] Backend `.env` file configured with credentials
- [ ] Frontend `.env` file has `VITE_API_URL=https://leaderboard.1to10x.com`
- [ ] Backend server is running and accessible
- [ ] SSL certificate is valid (HTTPS working)
- [ ] Test login flow end-to-end

## Security Notes

- ⚠️ Never commit `.env` files to git
- ⚠️ Keep Client Secret secure
- ⚠️ Use HTTPS in production (required for OAuth)
- ⚠️ Rotate credentials if compromised

