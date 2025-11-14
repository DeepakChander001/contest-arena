import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';
import verifyMemberHandler from './verify-member.js';
import getMemberDataHandler from './get-member-data.js';
import getMemberSpacesHandler from './get-member-spaces.js';
import getUserFromDbHandler from './get-user-from-db.js';
import { updateUserProfile, upload } from './update-user-profile.js';
import { getDailyRewards, claimDailyReward } from './daily-rewards.js';
import createProfileHandler from './create-profile.js';
import authCompleteHandler from './auth-complete.js';
import { 
  configureGoogleAuth, 
  getGoogleAuthUrl, 
  handleGoogleCallback, 
  getCurrentUser, 
  logout 
} from './google-auth.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const app = express();
const PORT = process.env.PORT || 3001;

// Configure Google OAuth
configureGoogleAuth();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://leaderboard.1to10x.com',
    'https://leaderboard.1to10x.com',
    'http://leaderboard.1to10x.com', // HTTP fallback
    'http://localhost:8080', // Development
    'http://localhost:8081', // Development
    'http://localhost:3000', // Development
    'http://localhost:5173', // Development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// CRITICAL: Add middleware to log all incoming requests for debugging
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`🔵 API Request: ${req.method} ${req.path}`);
  }
  next();
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS only)
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Allow cross-site in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Health check endpoint called');
  res.setHeader('Content-Type', 'application/json');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Google OAuth routes - MUST be registered before static file serving
// CRITICAL: These routes must return JSON, not HTML
app.get('/api/auth/google/url', (req, res, next) => {
  console.log('✅ API route /api/auth/google/url matched - calling handler');
  console.log('✅ Request method:', req.method);
  console.log('✅ Request path:', req.path);
  console.log('✅ Request URL:', req.url);
  console.log('✅ Request originalUrl:', req.originalUrl);
  
  // CRITICAL: Set JSON content type BEFORE calling handler
  res.setHeader('Content-Type', 'application/json');
  
  try {
    getGoogleAuthUrl(req, res);
  } catch (error) {
    console.error('❌ Error in OAuth URL handler:', error);
    next(error);
  }
});
app.get('/api/auth/google/callback', handleGoogleCallback);
app.get('/api/auth/user', getCurrentUser);
app.post('/api/auth/logout', logout);
app.post('/api/auth/complete', authCompleteHandler);

// Get user data from database (preferred method)
app.get('/api/user', (req, res) => {
  // If email not provided, pull from session user set during Google OAuth
  if (!req.query.email && (req as any).session?.user?.email) {
    (req as any).query.email = (req as any).session.user.email;
  }
  return getUserFromDbHandler(req as any, res as any);
});

// Aliases expected by frontend to fetch current member data using session (fallback to Circle API)
app.get('/api/member', (req, res) => {
  // If email not provided, pull from session user set during Google OAuth
  if (!req.query.email && (req as any).session?.user?.email) {
    (req as any).query.email = (req as any).session.user.email;
  }
  return getMemberDataHandler(req as any, res as any);
});

app.get('/api/member/spaces', (req, res) => {
  // Pass-through to existing handler; still expects memberId when required
  return getMemberSpacesHandler(req as any, res as any);
});

// Create user profile endpoint (for new Circle members)
app.post('/api/user/create-profile', (req, res) => {
  return createProfileHandler(req as any, res as any);
});

// Update user profile endpoint
app.put('/api/user/update', upload.single('profile_image'), (req, res) => {
  return updateUserProfile(req as any, res as any);
});

// Daily rewards endpoints
app.get('/api/daily-rewards', (req, res) => {
  console.log('🎁 GET /api/daily-rewards - Session:', !!req.session?.user);
  return getDailyRewards(req as any, res as any);
});

app.post('/api/daily-rewards/claim', (req, res) => {
  console.log('🎁 POST /api/daily-rewards/claim - Session:', !!req.session?.user);
  return claimDailyReward(req as any, res as any);
});

// Debug endpoint to check session
app.get('/api/debug/session', (req, res) => {
  res.json({
    session: req.session,
    user: req.session?.user,
    hasUser: !!req.session?.user,
    userEmail: req.session?.user?.email
  });
});

// Session refresh endpoint - manually set user data in session
app.post('/api/refresh-session', (req, res) => {
  try {
    const { userData } = req.body;
    
    // Ensure email is available from multiple sources
    const email = userData.email || userData.googleEmail;
    
    if (!userData || !email) {
      console.error('❌ No email found in userData:', userData);
      return res.status(400).json({ error: 'User data with email is required' });
    }
    
    // Store user in session with proper structure
    req.session.user = {
      id: userData.id || userData.googleId,
      email: email, // Primary email
      googleEmail: email, // Also set as googleEmail for compatibility
      name: userData.name || userData.googleName || 'User',
      googleId: userData.googleId || userData.id,
      googleName: userData.googleName || userData.name || 'User',
      googleAvatarUrl: userData.googleAvatarUrl || userData.avatarUrl
    };
    
    // Save session
    req.session.save((err) => {
      if (err) {
        console.error('❌ Error saving refreshed session:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }
      
      console.log('✅ Session refreshed successfully:', req.session.user);
      res.json({ 
        success: true, 
        message: 'Session refreshed successfully',
        user: req.session.user 
      });
    });
  } catch (error) {
    console.error('❌ Error refreshing session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard data endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    console.log('🏠 GET /api/dashboard - Session:', !!req.session?.user);
    
    if (!req.session?.user?.email) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userEmail = req.session.user.email;
    console.log('📧 Getting dashboard data for:', userEmail);

    // Get user profile and gamification data
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (profileError || !userProfile) {
      console.error('❌ User profile not found:', profileError);
      return res.status(404).json({ error: 'User profile not found' });
    }

    let { data: gamification, error: gamificationError } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_profile_id', userProfile.id)
      .single();

    // If gamification data doesn't exist, create it
    if (gamificationError || !gamification) {
      console.log('📝 Gamification data not found, creating default...');
      
      try {
        const { data: newGamification, error: createGamError } = await supabase
          .from('user_gamification')
          .insert({
            user_profile_id: userProfile.id,
            circle_member_id: userProfile.circle_id || null,
            current_level: 1,
            current_level_name: 'Level 1',
            total_points: 0,
            points_to_next_level: 500,
            level_progress: 0,
            updated_at: new Date().toISOString(),
          })
          .select('*')
          .single();

        if (createGamError) {
          console.error('❌ Error creating gamification data:', createGamError);
          
          // If it's a duplicate key error, try to fetch the existing one
          if (createGamError.code === '23505') {
            const { data: existingGam } = await supabase
              .from('user_gamification')
              .select('*')
              .eq('user_profile_id', userProfile.id)
              .single();
            
            if (existingGam) {
              gamification = existingGam;
              console.log('✅ Found existing gamification data after duplicate error');
            } else {
              // Use default values if we can't create or fetch
              gamification = {
                user_profile_id: userProfile.id,
                current_level: 1,
                current_level_name: 'Level 1',
                total_points: 0,
                points_to_next_level: 500,
                level_progress: 0,
                current_streak: 0,
                contests_joined: 0,
                win_rate: 0,
              };
              console.log('⚠️ Using default gamification values');
            }
          } else {
            // Use default values on other errors
            gamification = {
              user_profile_id: userProfile.id,
              current_level: 1,
              current_level_name: 'Level 1',
              total_points: 0,
              points_to_next_level: 500,
              level_progress: 0,
              current_streak: 0,
              contests_joined: 0,
              win_rate: 0,
            };
            console.log('⚠️ Using default gamification values due to error');
          }
        } else {
          gamification = newGamification;
          console.log('✅ Gamification data created successfully');
        }
      } catch (error: any) {
        console.error('❌ Exception creating gamification data:', error);
        // Use default values
        gamification = {
          user_profile_id: userProfile.id,
          current_level: 1,
          current_level_name: 'Level 1',
          total_points: 0,
          points_to_next_level: 500,
          level_progress: 0,
          current_streak: 0,
          contests_joined: 0,
          win_rate: 0,
        };
        console.log('⚠️ Using default gamification values due to exception');
      }
    }

    // Mock contest data (in real app, this would come from database)
    const dashboardData = {
      user: {
        name: userProfile.name || userProfile.first_name + ' ' + userProfile.last_name,
        email: userProfile.email,
        avatarUrl: userProfile.avatar_url,
        currentXP: gamification.total_points || 0,
        level: gamification.current_level || 1,
        nextLevelXP: (gamification.current_level || 1) * 500,
        streak: gamification.current_streak || 0,
        totalContests: gamification.contests_joined || 0,
        winRate: gamification.win_rate || 0
      },
      contests: [
        {
          id: "1",
          title: "AI Video Generation Challenge",
          type: "QUALITY",
          duration: "2 days",
          participants: 1247,
          prize: "$5,000",
          difficulty: "HARD",
          tags: ["AI", "Video", "Generation"],
          description: "Create an AI-powered video generation tool that can produce high-quality videos from text prompts.",
          requirements: ["Submit working prototype", "Include demo video", "Documentation required"],
          deadline: "2024-01-15T23:59:59Z",
          status: "ACTIVE"
        },
        {
          id: "2", 
          title: "Blockchain Voting System",
          type: "INNOVATION",
          duration: "5 days",
          participants: 892,
          prize: "$3,000",
          difficulty: "MEDIUM",
          tags: ["Blockchain", "Voting", "Security"],
          description: "Build a secure and transparent voting system using blockchain technology.",
          requirements: ["Smart contracts", "Frontend interface", "Security audit"],
          deadline: "2024-01-18T23:59:59Z",
          status: "ACTIVE"
        }
      ],
      stats: {
        monthlyXP: [120, 230, 180, 290, 310, 260, 340],
        recentActivity: [
          { type: "contest_join", message: "Joined AI Video Challenge", time: "2 hours ago" },
          { type: "xp_earn", message: "Earned 50 XP from daily login", time: "1 day ago" },
          { type: "badge_earn", message: "Earned 'Early Bird' badge", time: "2 days ago" }
        ]
      }
    };

    console.log('✅ Dashboard data fetched successfully');
    res.json(dashboardData);

  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔍 Testing database connection...');
    console.log('🔍 SUPABASE_URL:', supabaseUrl);
    console.log('🔍 SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? 'Present' : 'Missing');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return res.status(500).json({
        error: 'Supabase credentials not found',
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseServiceRoleKey,
        actualUrl: supabaseUrl
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Test basic connection
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database test error:', error);
      return res.status(500).json({
        error: 'Database connection failed',
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }

    res.json({
      success: true,
      message: 'Database connection successful',
      supabaseUrl: supabaseUrl.substring(0, 30) + '...',
      hasServiceRoleKey: !!supabaseServiceRoleKey
    });

  } catch (error: any) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
});

// Progress data endpoint
app.get('/api/progress', async (req, res) => {
  const getProgressDataHandler = (await import('./get-progress-data.js')).default;
  return getProgressDataHandler(req as any, res as any);
});

// Delete account endpoint
app.delete('/api/account/delete', async (req, res) => {
  const deleteAccountHandler = (await import('./delete-account.js')).default;
  return deleteAccountHandler(req as any, res as any);
});

// Leaderboard endpoint
app.get('/api/leaderboard', async (req, res) => {
  const getLeaderboardHandler = (await import('./get-leaderboard.js')).default;
  return getLeaderboardHandler(req as any, res as any);
});

// Legacy Circle.so endpoints (keeping for compatibility)
app.post('/api/verify-member', (req, res) => {
  verifyMemberHandler(req, res);
});

app.get('/api/member-data', (req, res) => {
  getMemberDataHandler(req, res);
});

app.get('/api/member-spaces', (req, res) => {
  getMemberSpacesHandler(req, res);
});

// ============================================================================
// STATIC FILE SERVING - MUST BE AFTER ALL API ROUTES
// ============================================================================
// Serve frontend static files in production (if frontend is built and in dist folder)
// This allows the backend to serve the React app for SPA routing
// CRITICAL: This is registered AFTER all API routes to ensure API routes are matched first

// Only set up static file serving in production AND when not on Vercel
// On Vercel, static files are served separately, so we don't need this
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const frontendDistPath = path.resolve(__dirname, '../dist');
  const fs = require('fs'); // Use require for synchronous check
  
  if (fs.existsSync(frontendDistPath)) {
    console.log('📦 Serving frontend static files from:', frontendDistPath);
    
    // CRITICAL: Create static file handler ONCE (not on every request)
    const staticHandler = express.static(frontendDistPath, {
      index: false, // Don't auto-serve index.html
    });
    
    // CRITICAL: Create a middleware that ONLY serves static files for NON-API routes
    // We explicitly check the path BEFORE calling express.static()
    // This middleware MUST be registered AFTER all API routes
    app.use((req, res, next) => {
      // CRITICAL: NEVER serve static files for API routes
      // Check both the path and ensure we're not matching API routes
      if (req.path.startsWith('/api/')) {
        // This is an API route - skip static file serving completely
        // DO NOT serve any static files for API routes
        return next(); // Pass to API route handlers
      }
      
      // This is NOT an API route - try to serve static file
      staticHandler(req, res, (err) => {
        // If static file not found (404), pass to next middleware (SPA routing)
        if (err && err.status === 404) {
          return next();
        }
        // If other error, pass it along
        if (err) {
          return next(err);
        }
      });
    });
    
    // SPA routing: serve index.html for all non-API routes that don't match static files
    // This must be the LAST route handler
    // CRITICAL: Use app.all() to catch all methods, but only handle GET for SPA
    app.all('*', (req, res, next) => {
      // CRITICAL: Never serve index.html for API routes
      if (req.path.startsWith('/api/')) {
        console.error('❌ ERROR: API route caught by catch-all route:', req.method, req.path);
        console.error('❌ This should never happen - API routes should be handled above');
        res.setHeader('Content-Type', 'application/json');
        return res.status(404).json({ 
          error: 'API endpoint not found', 
          path: req.path,
          method: req.method,
          message: 'This API route was caught by the catch-all handler. Check route registration order.'
        });
      }
      
      // Only handle GET requests for SPA routing
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      
      // Serve index.html for SPA routing (non-API routes only)
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  } else {
    console.log('⚠️ Frontend dist folder not found. Assuming frontend is served separately.');
  }
}

// ============================================================================
// EXPORT FOR VERCEL SERVERLESS FUNCTION
// ============================================================================
// Export the app as default for Vercel serverless functions
// Vercel will use this as the handler for all API routes
export default app;

// ============================================================================
// START SERVER (Only if not running on Vercel)
// ============================================================================
// If running locally or on a non-Vercel platform, start the server normally
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 API server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✓ Configured' : '✗ Missing'}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'https://leaderboard.1to10x.com'}`);
    console.log(`🍪 Session Secret: ${process.env.SESSION_SECRET ? '✓ Set' : '✗ Using default'}`);
    console.log(`📡 Server ready to accept requests`);
  });
} else {
  console.log('✅ Running on Vercel - app exported as serverless function');
}
