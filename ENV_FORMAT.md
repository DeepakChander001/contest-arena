# Environment Variables Format

## Backend .env File

Create a `.env` file in the `backend` directory with the following variables:

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
SESSION_SECRET=your_secure_session_secret_here

# Legacy Circle.so Configuration (Optional - keeping for compatibility)
CIRCLE_API_TOKEN=your_circle_api_token_here
CIRCLE_ADMIN_API_TOKEN=your_circle_admin_api_token_here
VITE_CIRCLE_API_URL=https://app.circle.so/api/v1/headless/auth_token
VITE_CIRCLE_ADMIN_API_TOKEN=your_circle_admin_api_token_here
```

## Frontend .env File

Create a `.env` file in the project root with:

```env
# API Configuration
VITE_API_URL=https://leaderboard.1to10x.com
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `https://leaderboard.1to10x.com/api/auth/google/callback` (production)
   - `http://localhost:3001/api/auth/google/callback` (development - optional)
7. Copy the Client ID and Client Secret to your `.env` file

## Required Values

**You need to provide:**
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `SESSION_SECRET` - A secure random string (32+ characters)

**Optional but recommended:**
- `FRONTEND_URL` - Your frontend URL (defaults to localhost:5173)
- `PORT` - Backend port (defaults to 3001)

## Security Notes

- Never commit `.env` files to version control
- Use strong, random session secrets in production
- Set `NODE_ENV=production` for production deployments
- Use HTTPS in production
- Rotate secrets regularly
