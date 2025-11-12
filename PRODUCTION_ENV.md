# Production Environment Variables

## Domain: leaderboard.1to10x.com

### Backend .env File (backend/.env)

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://leaderboard.1to10x.com/api/auth/google/callback

# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://leaderboard.1to10x.com

# Session Configuration
SESSION_SECRET=your_secure_session_secret_here_32_chars_minimum

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Circle.so Configuration
CIRCLE_ADMIN_API_TOKEN=your_circle_admin_api_token_here
```

### Frontend .env File (root/.env)

```env
# API Configuration
VITE_API_URL=https://leaderboard.1to10x.com
```

## Important: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your OAuth 2.0 Client ID
3. Add Authorized redirect URIs:
   - **Production**: `https://leaderboard.1to10x.com/api/auth/google/callback`
   - **Development** (optional): `http://localhost:3001/api/auth/google/callback`

## Deployment Notes

- All URLs have been updated to use `https://leaderboard.1to10x.com`
- Backend API will be accessible at: `https://leaderboard.1to10x.com/api/*`
- Frontend will be served from: `https://leaderboard.1to10x.com`
- OAuth callback URL: `https://leaderboard.1to10x.com/api/auth/google/callback`

## SSL/HTTPS Requirements

- Ensure SSL certificate is configured for `leaderboard.1to10x.com`
- All API calls use HTTPS
- Session cookies require secure flag in production

