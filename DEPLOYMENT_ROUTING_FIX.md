# Deployment Routing Fix for SPA (Single Page Application)

## Problem
The `/auth` route (and other React Router routes) show 404 errors because the server doesn't know to serve `index.html` for all routes.

## Solution
Configure your deployment platform to serve `index.html` for all non-API routes (SPA routing).

## Platform-Specific Solutions

### Option 1: Vercel (Recommended for Easy Deployment)

**File: `vercel.json`** (already created)
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Deployment Steps:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel will automatically detect `vercel.json`
4. All routes will work correctly

### Option 2: Netlify

**File: `public/_redirects`** (already created)
```
/api/*  https://leaderboard.1to10x.com/api/:splat  200
/*      /index.html  200
```

**Deployment Steps:**
1. Build your frontend: `npm run build`
2. Deploy `dist` folder to Netlify
3. Netlify will automatically use `_redirects` file

### Option 3: Nginx (Self-Hosted)

**File: `nginx.conf`** (already created)

**Configuration:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Setup Steps:**
1. Copy `nginx.conf` to `/etc/nginx/sites-available/leaderboard.1to10x.com`
2. Update SSL certificate paths
3. Update backend proxy port if different
4. Enable site: `sudo ln -s /etc/nginx/sites-available/leaderboard.1to10x.com /etc/nginx/sites-enabled/`
5. Test: `sudo nginx -t`
6. Reload: `sudo systemctl reload nginx`

### Option 4: Apache (Self-Hosted)

**File: `.htaccess`** (create in `public` folder)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^api/ - [L]
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Option 5: Backend Serves Frontend (Updated)

The backend server (`backend/server.ts`) has been updated to serve the frontend in production mode.

**How it works:**
- In production, backend checks for `dist` folder
- If found, serves static files from `dist`
- All non-API routes serve `index.html` (SPA routing)

**To use this:**
1. Build frontend: `npm run build`
2. Ensure `dist` folder is in project root
3. Backend will automatically serve it

## Testing

After deployment, test these URLs:
- ✅ `https://leaderboard.1to10x.com/` - Should load landing page
- ✅ `https://leaderboard.1to10x.com/auth` - Should load auth page (NOT 404)
- ✅ `https://leaderboard.1to10x.com/dashboard` - Should load dashboard (if logged in)
- ✅ `https://leaderboard.1to10x.com/api/health` - Should return API response

## Common Issues

### Issue: Still getting 404 on `/auth`
**Solutions:**
1. Clear browser cache
2. Verify deployment platform configuration
3. Check that `index.html` is being served for all routes
4. Verify build output includes `index.html`

### Issue: API routes returning 404
**Solutions:**
1. Ensure API routes are excluded from SPA routing
2. Check backend server is running
3. Verify proxy configuration (if using Nginx/Apache)

### Issue: OAuth callback not working
**Solutions:**
1. Verify GCP callback URL: `https://leaderboard.1to10x.com/api/auth/google/callback`
2. Check backend is accessible at `/api/auth/google/callback`
3. Verify CORS is configured correctly

## Quick Fix Checklist

- [ ] Created `vercel.json` (for Vercel)
- [ ] Created `public/_redirects` (for Netlify)
- [ ] Created `nginx.conf` (for Nginx)
- [ ] Updated `backend/server.ts` to serve frontend
- [ ] Built frontend: `npm run build`
- [ ] Tested `/auth` route (should NOT be 404)
- [ ] Tested API routes (should work)
- [ ] Verified OAuth callback URL in GCP

## Current Status

✅ All configuration files created
✅ Backend updated to serve frontend in production
✅ Ready for deployment

