# Vercel Deployment Fix - API Routes Returning HTML

## Problem
Vercel is serving static HTML files (`index.html`) for API routes instead of proxying them to the backend server. This causes the error:
```
❌ Response is not JSON. Content type: text/html; charset=utf-8
```

## Root Cause
The `vercel.json` configuration was trying to use serverless functions, but the backend is running as a separate Node.js server. Vercel needs to **proxy** API requests to the backend server, not serve them as static files.

## Solution

### Option 1: Proxy to Separate Backend Server (Recommended)

If your backend is running on a separate server (e.g., `https://api.1to10x.com` or `https://backend.1to10x.com`), update `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-server.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Replace `https://your-backend-server.com` with your actual backend URL.**

### Option 2: Deploy Backend as Vercel Serverless Function

If you want to deploy the backend on Vercel as a serverless function:

1. **Update `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

2. **Update `backend/server.ts` to export the app:**
```typescript
// At the end of server.ts
export default app;
```

3. **Install Vercel CLI and deploy:**
```bash
npm i -g vercel
vercel
```

### Option 3: Use Vercel Environment Variables

If your backend is on a different domain, set it as an environment variable:

1. **In Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Add: `BACKEND_URL=https://your-backend-server.com`

2. **Update `vercel.json`:**
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "${BACKEND_URL}/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Current Configuration

The current `vercel.json` has been updated to proxy API requests. **You need to replace the placeholder URL with your actual backend server URL.**

## Testing

After updating `vercel.json`:

1. **Redeploy on Vercel:**
   - Push changes to GitHub
   - Vercel will auto-deploy
   - Or manually redeploy from Vercel dashboard

2. **Test API endpoint:**
   ```bash
   curl https://leaderboard.1to10x.com/api/auth/google/url
   ```
   Should return JSON, not HTML.

3. **Check response headers:**
   - Should NOT have `server: "Vercel"` for API routes
   - Should have `Content-Type: application/json`
   - Should NOT have `content-disposition: "inline; filename=\"index.html\""`

## Important Notes

- **Backend must be accessible:** Your backend server must be publicly accessible at the URL you specify
- **CORS:** Ensure your backend has CORS configured to allow requests from `https://leaderboard.1to10x.com`
- **HTTPS:** Use HTTPS URLs for the backend proxy destination
- **Environment Variables:** If using environment variables, ensure they're set in Vercel dashboard

## Next Steps

1. **Identify your backend server URL:**
   - Is it running on a separate server?
   - What's the domain/IP?
   - Is it accessible via HTTPS?

2. **Update `vercel.json`** with the correct backend URL

3. **Redeploy** and test

4. **If backend is not accessible:**
   - Deploy backend to a service (Railway, Render, Fly.io, etc.)
   - Or use Option 2 to deploy backend as Vercel serverless function

