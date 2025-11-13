import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    // Get user profile from Supabase
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_gamification(*),
        user_activity(*),
        user_badges(*),
        user_spaces(*)
      `)
      .eq('email', email)
      .single();

    if (error || !profile) {
      // If not in Supabase, fetch from Circle and save
      const circleApiToken = process.env.CIRCLE_API_TOKEN || process.env.CIRCLE_HEADLESS_API_KEY;
      
      if (!circleApiToken) {
        return res.status(500).json({ error: 'Circle API not configured' });
      }

      const circleResponse = await fetch(
        `https://app.circle.so/api/v1/community_members?email=${encodeURIComponent(email as string)}`,
        {
          headers: {
            'Authorization': `Token ${circleApiToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!circleResponse.ok) {
        return res.status(404).json({ error: 'User not found' });
      }

      const circleData = await circleResponse.json();
      const circleMember = Array.isArray(circleData) ? circleData[0] : circleData;

      if (!circleMember || !circleMember.id) {
        return res.status(404).json({ error: 'Circle member not found' });
      }

      // Save to Supabase (same logic as auth/complete.ts)
      const { data: newProfile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          circle_id: circleMember.id,
          email: circleMember.email || email,
          name: circleMember.name,
          first_name: circleMember.first_name,
          last_name: circleMember.last_name,
          avatar_url: circleMember.avatar_url,
          bio: circleMember.bio || null,
          created_at: circleMember.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_seen_at: circleMember.last_seen_at || new Date().toISOString()
        }, {
          onConflict: 'circle_id'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        return res.status(500).json({ error: 'Failed to save profile' });
      }

      // Save gamification stats
      if (circleMember.gamification_stats) {
        await supabase.from('user_gamification').upsert({
          user_profile_id: newProfile.id,
          circle_member_id: circleMember.id,
          current_level: circleMember.gamification_stats.current_level || 1,
          total_points: circleMember.gamification_stats.total_points || 0,
          points_to_next_level: circleMember.gamification_stats.points_to_next_level || 1000,
          level_progress: circleMember.gamification_stats.level_progress || 0
        }, {
          onConflict: 'circle_member_id'
        });
      }

      // Save activity data
      await supabase.from('user_activity').upsert({
        user_profile_id: newProfile.id,
        circle_member_id: circleMember.id,
        posts_count: circleMember.posts_count || 0,
        comments_count: circleMember.comments_count || 0,
        activity_score: circleMember.activity_score?.activity_score || 0
      }, {
        onConflict: 'circle_member_id'
      });

      // Format response from Circle data
      const userData = {
        id: circleMember.id.toString(),
        email: circleMember.email || email,
        name: circleMember.name,
        avatarUrl: circleMember.avatar_url,
        level: circleMember.gamification_stats?.current_level || 1,
        currentXP: circleMember.gamification_stats?.total_points || 0,
        nextLevelXP: circleMember.gamification_stats?.points_to_next_level || 1000,
        progressPct: (circleMember.gamification_stats?.level_progress || 0) * 100,
        badges: (circleMember.member_tags || []).map((tag: any) => ({ 
          id: tag.id, 
          name: tag.name,
          earned: true
        })),
        postsCount: circleMember.posts_count || 0,
        commentsCount: circleMember.comments_count || 0,
        activityScore: circleMember.activity_score?.activity_score || "0",
        bio: circleMember.bio || null,
        spaces: [],
        createdAt: circleMember.created_at,
        lastSeenAt: circleMember.last_seen_at
      };

      return res.status(200).json(userData);
    }

    // Format response from Supabase data
    const gamification = Array.isArray(profile.user_gamification) ? profile.user_gamification[0] : profile.user_gamification;
    const activity = Array.isArray(profile.user_activity) ? profile.user_activity[0] : profile.user_activity;
    const badges = Array.isArray(profile.user_badges) ? profile.user_badges : [];
    const spaces = Array.isArray(profile.user_spaces) ? profile.user_spaces : [];

    const userData = {
      id: profile.circle_id?.toString() || profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatar_url,
      googleId: profile.google_id,
      level: gamification?.current_level || 1,
      currentXP: gamification?.total_points || 0,
      nextLevelXP: gamification?.points_to_next_level || 1000,
      progressPct: (gamification?.level_progress || 0) * 100,
      badges: badges.map((badge: any) => ({
        id: badge.badge_id,
        name: badge.badge_name,
        earned: badge.earned
      })),
      postsCount: activity?.posts_count || 0,
      commentsCount: activity?.comments_count || 0,
      activityScore: activity?.activity_score?.toString() || "0",
      bio: profile.bio,
      spaces: spaces.map((space: any) => ({
        id: space.space_id,
        name: space.space_name,
        description: space.space_description
      })),
      createdAt: profile.created_at,
      lastSeenAt: profile.last_seen_at
    };

    return res.status(200).json(userData);

  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

