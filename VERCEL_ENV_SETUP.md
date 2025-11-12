# Vercel Environment Variables Setup

## Required Environment Variables

You need to set these environment variables in your Vercel project dashboard:

### How to Set Environment Variables in Vercel:

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project: `contest-arena` (or your project name)
3. Go to **Settings** → **Environment Variables**
4. Add each variable below:

### Backend Environment Variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://leaderboard.1to10x.com/api/auth/google/callback

# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://leaderboard.1to10x.com

# Session Configuration
SESSION_SECRET=your_secure_random_string_here_min_32_characters

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Circle.so Configuration
CIRCLE_ADMIN_API_TOKEN=your_circle_admin_api_token
```

### Important Notes:

1. **SESSION_SECRET**: Generate a secure random string (at least 32 characters):
   ```bash
   # On Linux/Mac:
   openssl rand -base64 32
   
   # Or use an online generator:
   # https://randomkeygen.com/
   ```

2. **Environment Scope**: 
   - Set all variables for **Production**, **Preview**, and **Development** environments
   - Or at minimum, set for **Production**

3. **After Adding Variables**:
   - **Redeploy** your project for changes to take effect
   - Go to **Deployments** → Click **Redeploy** on the latest deployment

### Local Development (.env file):

For local development, create `backend/.env` with the same variables:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your_secure_random_string_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CIRCLE_ADMIN_API_TOKEN=your_circle_admin_api_token
```

## Verification Checklist

After setting environment variables:

- [ ] All variables are set in Vercel dashboard
- [ ] Variables are set for Production environment
- [ ] Project has been redeployed after adding variables
- [ ] `GOOGLE_CLIENT_ID` is not empty or placeholder
- [ ] `SESSION_SECRET` is at least 32 characters
- [ ] `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- [ ] `CIRCLE_ADMIN_API_TOKEN` is valid

## Testing

After redeploying with environment variables:

1. Test API endpoint:
   ```bash
   curl https://leaderboard.1to10x.com/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. Test OAuth endpoint:
   ```bash
   curl https://leaderboard.1to10x.com/api/auth/google/url
   ```
   Should return JSON with OAuth URL (not HTML, not 502 error)

3. Check Vercel function logs:
   - Go to Vercel Dashboard → Your Project → Functions
   - Check logs for any errors

## Common Issues

### Issue: Still getting 502 Bad Gateway
**Solution**: 
- Verify all environment variables are set correctly
- Check that `GOOGLE_CLIENT_ID` is not a placeholder
- Redeploy the project after adding variables

### Issue: "Google OAuth not configured"
**Solution**:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check they're not empty strings
- Ensure they're set for Production environment

### Issue: Session errors
**Solution**:
- Verify `SESSION_SECRET` is set and is at least 32 characters
- Generate a new secure random string if needed

