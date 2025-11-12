# Setup Instructions for Google OAuth

## 🚨 **CURRENT STATUS**

The backend server is now running on port 3001, but Google OAuth credentials are not configured yet. You'll see the error "Failed to get Google OAuth URL" until you add your Google credentials.

## 🔧 **IMMEDIATE FIXES APPLIED**

1. ✅ **Fixed CORS Issue**: Added port 8080 to allowed origins
2. ✅ **Fixed Label Import**: Removed unused Label import from Auth.tsx
3. ✅ **Started Backend Server**: Test server is running on port 3001

## 📋 **NEXT STEPS TO COMPLETE SETUP**

### **Step 1: Create Backend .env File**

Create a file called `.env` in the `backend` folder with these contents:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# Session Configuration
SESSION_SECRET=your-secure-random-session-secret-here-32-chars-minimum
```

### **Step 2: Get Google OAuth Credentials**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env` file

### **Step 3: Restart Backend Server**

After adding the `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart with:
cd backend
npm run dev
```

### **Step 4: Test the Application**

1. Go to `http://localhost:8080/auth`
2. Click "Login with Google"
3. You should be redirected to Google OAuth
4. After authorization, you'll be redirected back to the dashboard

## 🔍 **CURRENT ERROR EXPLANATION**

The error "Failed to get Google OAuth URL" appears because:
- The backend server is running ✅
- But Google OAuth credentials are not configured ❌
- The server returns a helpful error message explaining what's needed

## 🛠️ **ALTERNATIVE: Quick Test Without Google OAuth**

If you want to test the frontend without setting up Google OAuth, I can create a mock authentication system. Let me know if you'd prefer this approach.

## 📞 **NEED HELP?**

The setup is almost complete! You just need to:
1. Create the `.env` file with your Google credentials
2. Restart the backend server

Once you do this, the Google OAuth login will work perfectly!
