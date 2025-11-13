// Vercel serverless function entry point
// This file handles all API routes for Vercel deployment
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';

// Import all handlers
import verifyMemberHandler from '../backend/verify-member.js';
import getMemberDataHandler from '../backend/get-member-data.js';
import getMemberSpacesHandler from '../backend/get-member-spaces.js';
import getUserFromDbHandler from '../backend/get-user-from-db.js';
import { updateUserProfile, upload } from '../backend/update-user-profile.js';
import { getDailyRewards, claimDailyReward } from '../backend/daily-rewards.js';
import createProfileHandler from '../backend/create-profile.js';
import { 
  configureGoogleAuth, 
  getGoogleAuthUrl, 
  handleGoogleCallback, 
  getCurrentUser, 
  logout 
} from '../backend/google-auth.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });
dotenv.config({ path: path.resolve(__dirname, '../backend/.env.local') });

const app = express();

// Configure Google OAuth
configureGoogleAuth();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://leaderboard.1to10x.com',
    'https://leaderboard.1to10x.com',
    'http://leaderboard.1to10x.com',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`📥 Incoming request: ${req.method} ${req.path} ${req.url}`);
  if (req.path.startsWith('/api/')) {
    console.log(`🔵 API Request: ${req.method} ${req.path} ${req.url}`);
  }
  next();
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
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

// Google OAuth routes
app.get('/api/auth/google/url', (req, res, next) => {
  console.log('✅ API route /api/auth/google/url matched - calling handler');
  console.log('✅ Request method:', req.method);
  console.log('✅ Request path:', req.path);
  console.log('✅ Request URL:', req.url);
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

// New Circle-Supabase integration endpoint
app.post('/api/auth/complete', async (req, res) => {
  try {
    // Import and use the handler from the separate file
    const completeHandler = (await import('./auth/complete.js')).default;
    return completeHandler(req, res);
  } catch (error: any) {
    console.error('Error in auth/complete:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get user data from database
app.get('/api/user', (req, res) => {
  if (!req.query.email && (req as any).session?.user?.email) {
    (req as any).query.email = (req as any).session.user.email;
  }
  return getUserFromDbHandler(req as any, res as any);
});

// New Circle-Supabase integration endpoint for user profile
app.get('/api/user/profile', async (req, res) => {
  try {
    // Import and use the handler from the separate file
    const profileHandler = (await import('./user/profile.js')).default;
    return profileHandler(req, res);
  } catch (error: any) {
    console.error('Error in user/profile:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Member data endpoints
app.get('/api/member', (req, res) => {
  if (!req.query.email && (req as any).session?.user?.email) {
    (req as any).query.email = (req as any).session.user.email;
  }
  return getMemberDataHandler(req as any, res as any);
});

app.get('/api/member/spaces', (req, res) => {
  return getMemberSpacesHandler(req as any, res as any);
});

// Create user profile endpoint
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

// Debug endpoint
app.get('/api/debug/session', (req, res) => {
  res.json({
    session: req.session,
    user: req.session?.user,
    hasUser: !!req.session?.user,
    userEmail: req.session?.user?.email
  });
});

// Session refresh endpoint
app.post('/api/refresh-session', (req, res) => {
  try {
    const { userData } = req.body;
    const email = userData.email || userData.googleEmail;
    
    if (!userData || !email) {
      console.error('❌ No email found in userData:', userData);
      return res.status(400).json({ error: 'User data with email is required' });
    }
    
    req.session.user = {
      id: userData.id || userData.googleId,
      email: email,
      googleEmail: email,
      name: userData.name || userData.googleName || 'User',
      googleId: userData.googleId || userData.id,
      googleName: userData.googleName || userData.name || 'User',
      googleAvatarUrl: userData.googleAvatarUrl || userData.avatarUrl
    };
    
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

// Dashboard endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    console.log('🏠 GET /api/dashboard - Session:', !!req.session?.user);
    
    if (!req.session?.user?.email) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userEmail = req.session.user.email;
    console.log('📧 Getting dashboard data for:', userEmail);

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
          if (createGamError.code === '23505') {
            const { data: existingGam } = await supabase
              .from('user_gamification')
              .select('*')
              .eq('user_profile_id', userProfile.id)
              .single();
            
            if (existingGam) {
              gamification = existingGam;
            } else {
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
            }
          } else {
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
          }
        } else {
          gamification = newGamification;
        }
      } catch (error: any) {
        console.error('❌ Exception creating gamification data:', error);
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
      }
    }

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
      contests: [],
      stats: {
        monthlyXP: [120, 230, 180, 290, 310, 260, 340],
        recentActivity: []
      }
    };

    console.log('✅ Dashboard data fetched successfully');
    res.json(dashboardData);

  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Progress endpoint
app.get('/api/progress', async (req, res) => {
  const getProgressDataHandler = (await import('../backend/get-progress-data.js')).default;
  return getProgressDataHandler(req as any, res as any);
});

// Delete account endpoint
app.delete('/api/account/delete', async (req, res) => {
  const deleteAccountHandler = (await import('../backend/delete-account.js')).default;
  return deleteAccountHandler(req as any, res as any);
});

// Leaderboard endpoint
app.get('/api/leaderboard', async (req, res) => {
  const getLeaderboardHandler = (await import('../backend/get-leaderboard.js')).default;
  return getLeaderboardHandler(req as any, res as any);
});

// Legacy endpoints
app.post('/api/verify-member', (req, res) => {
  verifyMemberHandler(req, res);
});

app.get('/api/member-data', (req, res) => {
  getMemberDataHandler(req, res);
});

app.get('/api/member-spaces', (req, res) => {
  getMemberSpacesHandler(req, res);
});

// Export the app for Vercel
export default app;
