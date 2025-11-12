import { Request, Response } from 'express';

/**
 * Get leaderboard data with filtering options
 * Supports: global, this month, this week, by level
 */
export default async function getLeaderboardHandler(req: Request, res: Response) {
  try {
    console.log('🏆 Fetching leaderboard data...');
    
    if (!req.session?.user?.email) {
      return res.status(401).json({ error: 'Not authenticated', message: 'No email found in session' });
    }

    const userEmail = req.session.user.email;
    const filter = (req.query.filter as string) || 'global'; // global, month, week, level
    
    console.log('📧 Getting leaderboard for:', userEmail, 'Filter:', filter);

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get current user's profile and gamification data
    const { data: currentUserProfile, error: currentUserError } = await supabase
      .from('user_profiles')
      .select('id, email, circle_id')
      .eq('email', userEmail)
      .single();

    if (currentUserError || !currentUserProfile) {
      console.error('❌ Current user profile not found:', currentUserError);
      return res.status(404).json({ error: 'User profile not found' });
    }

    const { data: currentUserGamification } = await supabase
      .from('user_gamification')
      .select('current_level, total_points')
      .eq('user_profile_id', currentUserProfile.id)
      .single();

    const currentUserLevel = currentUserGamification?.current_level || 1;

    // Calculate date ranges for filtering
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of this week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Fetch all users with their gamification data
    const { data: allUsers, error: usersError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        name,
        avatar_url,
        circle_id,
        created_at,
        user_gamification (
          current_level,
          current_level_name,
          total_points,
          points_to_next_level,
          level_progress,
          updated_at
        )
      `)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }

    if (!allUsers || allUsers.length === 0) {
      return res.json({
        leaderboard: [],
        currentUserRank: null,
        currentUserPosition: null,
        totalUsers: 0,
        filter
      });
    }

    // Get XP transactions for time-based filtering
    let xpTransactions: any[] = [];
    if (filter === 'month' || filter === 'week') {
      const startDate = filter === 'week' ? startOfWeek.toISOString() : startOfMonth.toISOString();
      
      const { data: transactions, error: txError } = await supabase
        .from('user_xp_transactions')
        .select('user_profile_id, xp_amount, created_at')
        .gte('created_at', startDate);

      if (!txError && transactions) {
        xpTransactions = transactions;
      }
    }

    // Get badge counts for all users
    const { data: allBadges, error: badgesError } = await supabase
      .from('user_badges')
      .select('user_profile_id');

    const badgeCounts: { [key: string]: number } = {};
    if (!badgesError && allBadges) {
      allBadges.forEach((badge: any) => {
        badgeCounts[badge.user_profile_id] = (badgeCounts[badge.user_profile_id] || 0) + 1;
      });
    }

    // Process leaderboard entries
    const leaderboardEntries: any[] = [];

    for (const user of allUsers) {
      if (!user.user_gamification || user.user_gamification.length === 0) {
        continue; // Skip users without gamification data
      }

      const gamification = Array.isArray(user.user_gamification) 
        ? user.user_gamification[0] 
        : user.user_gamification;

      // Apply level filter if needed
      if (filter === 'level') {
        const userLevel = gamification.current_level || 1;
        if (userLevel !== currentUserLevel) {
          continue; // Skip users not at the same level
        }
      }

      let totalXP = gamification.total_points || 0;

      // Apply time-based filtering
      if (filter === 'month' || filter === 'week') {
        const userXPTransactions = xpTransactions.filter(
          (tx: any) => tx.user_profile_id === user.id
        );
        totalXP = userXPTransactions.reduce((sum: number, tx: any) => sum + (tx.xp_amount || 0), 0);
      }

      // Skip users with 0 XP if filtering by time period
      if ((filter === 'month' || filter === 'week') && totalXP === 0) {
        continue;
      }

      leaderboardEntries.push({
        userId: user.id,
        email: user.email,
        username: user.name || user.email.split('@')[0],
        avatarUrl: user.avatar_url || null,
        level: gamification.current_level || 1,
        levelName: gamification.current_level_name || `Level ${gamification.current_level || 1}`,
        totalXP: totalXP,
        badges: badgeCounts[user.id] || 0,
        contestsWon: 0, // TODO: Implement contest wins tracking
        trend: 'same', // TODO: Calculate trend from historical data
        change: 0, // TODO: Calculate rank change
        isCurrentUser: user.email === userEmail,
      });
    }

    // Sort by total XP (descending)
    leaderboardEntries.sort((a, b) => b.totalXP - a.totalXP);

    // Assign ranks
    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Find current user's position
    const currentUserEntry = leaderboardEntries.find(entry => entry.isCurrentUser);
    const currentUserRank = currentUserEntry ? currentUserEntry.rank : null;
    const currentUserPosition = currentUserEntry ? {
      rank: currentUserRank,
      totalXP: currentUserEntry.totalXP,
      level: currentUserEntry.level,
      badges: currentUserEntry.badges,
      gapToNext: currentUserRank && currentUserRank > 1 
        ? leaderboardEntries[currentUserRank - 2].totalXP - currentUserEntry.totalXP
        : null,
      nextUser: currentUserRank && currentUserRank > 1 
        ? {
            username: leaderboardEntries[currentUserRank - 2].username,
            totalXP: leaderboardEntries[currentUserRank - 2].totalXP,
          }
        : null,
      percentile: leaderboardEntries.length > 0
        ? Math.round(((leaderboardEntries.length - currentUserRank!) / leaderboardEntries.length) * 100)
        : 0,
    } : null;

    // Limit to top 100
    const topLeaderboard = leaderboardEntries.slice(0, 100);

    console.log('✅ Leaderboard data fetched successfully');
    res.json({
      leaderboard: topLeaderboard,
      currentUserRank,
      currentUserPosition,
      totalUsers: leaderboardEntries.length,
      filter
    });

  } catch (error: any) {
    console.error('❌ Error fetching leaderboard data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

