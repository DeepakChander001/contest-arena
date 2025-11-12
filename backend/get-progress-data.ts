import { Request, Response } from 'express';

/**
 * Get user progress data for graphs
 * Returns Circle activity and Web app activity data
 */
export default async function getProgressDataHandler(req: Request, res: Response) {
  try {
    console.log('📊 Fetching progress data...');
    console.log('📊 Session exists:', !!req.session);
    console.log('📊 Session user exists:', !!req.session?.user);
    console.log('📊 Session user email:', req.session?.user?.email);
    
    if (!req.session?.user?.email) {
      console.error('❌ No email in session. Session data:', {
        hasSession: !!req.session,
        hasUser: !!req.session?.user,
        userKeys: req.session?.user ? Object.keys(req.session.user) : [],
        userData: req.session?.user
      });
      return res.status(401).json({ error: 'Not authenticated', message: 'No email found in session' });
    }

    const userEmail = req.session.user.email;
    console.log('📧 Getting progress data for:', userEmail);

    // Get Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, circle_id, created_at')
      .eq('email', userEmail)
      .single();

    if (profileError || !userProfile) {
      console.error('❌ User profile not found:', profileError);
      return res.status(404).json({ error: 'User profile not found' });
    }

    // 1. Get Circle Activity Data (from user_activity table)
    const { data: circleActivity, error: activityError } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_profile_id', userProfile.id)
      .order('updated_at', { ascending: false })
      .limit(30); // Get last 30 activity records

    // 2. Get Web App Activity - XP Transactions
    const { data: xpTransactions, error: xpError } = await supabase
      .from('user_xp_transactions')
      .select('*')
      .eq('user_profile_id', userProfile.id)
      .order('created_at', { ascending: false })
      .limit(100); // Get last 100 transactions

    // 3. Get Daily Login History
    const { data: dailyLogins, error: loginError } = await supabase
      .from('user_daily_logins')
      .select('*')
      .eq('user_profile_id', userProfile.id)
      .order('login_date', { ascending: false })
      .limit(90); // Get last 90 days

    // 4. Get Gamification History (if we track it)
    const { data: gamification, error: gamError } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_profile_id', userProfile.id)
      .single();

    // Process data for graphs
    const now = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const last7Days = last30Days.slice(-7);
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (11 - i));
      return date.toISOString().slice(0, 7); // YYYY-MM format
    });

    // Process XP over time (daily)
    const xpByDay = last30Days.map(date => {
      const dayTransactions = xpTransactions?.filter(t => {
        const txDate = new Date(t.created_at).toISOString().split('T')[0];
        return txDate === date;
      }) || [];
      const totalXp = dayTransactions.reduce((sum, t) => sum + (t.xp_amount || 0), 0);
      return {
        date,
        xp: totalXp,
        transactions: dayTransactions.length
      };
    });

    // Process XP over time (monthly)
    const xpByMonth = last12Months.map(month => {
      const monthTransactions = xpTransactions?.filter(t => {
        const txDate = new Date(t.created_at).toISOString().slice(0, 7);
        return txDate === month;
      }) || [];
      const totalXp = monthTransactions.reduce((sum, t) => sum + (t.xp_amount || 0), 0);
      return {
        month,
        xp: totalXp,
        transactions: monthTransactions.length
      };
    });

    // Process Circle Activity Scores (if we have historical data)
    const circleActivityScores = circleActivity && circleActivity.length > 0 
      ? circleActivity.map(activity => ({
          date: new Date(activity.updated_at).toISOString().split('T')[0],
          activity_score: activity.activity_score || 0,
          presence: activity.presence_score || 0,
          participation: activity.participation_score || 0,
          contribution: activity.contribution_score || 0,
          connection: activity.connection_score || 0,
          posts: activity.posts_count || 0,
          comments: activity.comments_count || 0,
        }))
      : [];

    // Process Daily Login Streak
    const loginStreak = dailyLogins?.map(login => ({
      date: login.login_date,
      streak_count: login.streak_count || 0,
      xp_earned: login.xp_earned || 0,
    })) || [];

    // Activity breakdown by type
    const activityByType = {
      daily_login: xpTransactions?.filter(t => t.transaction_type === 'daily_login').length || 0,
      contest: xpTransactions?.filter(t => t.transaction_type === 'contest').length || 0,
      badge: xpTransactions?.filter(t => t.transaction_type === 'badge').length || 0,
      other: xpTransactions?.filter(t => !['daily_login', 'contest', 'badge'].includes(t.transaction_type)).length || 0,
    };

    // Recent activities
    const recentActivities = xpTransactions?.slice(0, 10).map(tx => ({
      type: tx.transaction_type || 'activity',
      description: tx.description || 'Activity',
      xp: tx.xp_amount || 0,
      time: new Date(tx.created_at).toISOString(),
      timeAgo: getTimeAgo(new Date(tx.created_at)),
    })) || [];

    // Current stats
    const currentStats = {
      totalXP: gamification?.total_points || 0,
      currentLevel: gamification?.current_level || 1,
      streak: dailyLogins?.[0]?.streak_count || 0,
      circleActivityScore: circleActivity?.[0]?.activity_score || 0,
      postsCount: circleActivity?.[0]?.posts_count || 0,
      commentsCount: circleActivity?.[0]?.comments_count || 0,
      totalTransactions: xpTransactions?.length || 0,
      totalLogins: dailyLogins?.length || 0,
    };

    const progressData = {
      // Time series data for graphs
      xpOverTime: {
        daily: xpByDay,
        monthly: xpByMonth,
      },
      // Circle activity data
      circleActivity: {
        scores: circleActivityScores,
        current: circleActivity?.[0] || null,
        history: circleActivity || [],
      },
      // Web app activity
      webAppActivity: {
        dailyLogins: loginStreak,
        xpTransactions: xpTransactions || [],
        activityByType,
      },
      // Recent activities
      recentActivities,
      // Current stats
      currentStats,
      // User info
      user: {
        email: userProfile.email,
        joinedDate: userProfile.created_at,
      }
    };

    console.log('✅ Progress data fetched successfully');
    res.json(progressData);

  } catch (error: any) {
    console.error('❌ Error fetching progress data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
}

