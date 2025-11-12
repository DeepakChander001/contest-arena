import { Request, Response } from 'express';

/**
 * Delete user account and all related data
 * This permanently deletes:
 * - user_profiles
 * - user_gamification
 * - user_badges
 * - user_activity
 * - user_daily_logins
 * - user_xp_transactions
 */
export default async function deleteAccountHandler(req: Request, res: Response) {
  try {
    console.log('🗑️ Deleting user account...');
    
    if (!req.session?.user?.email) {
      return res.status(401).json({ 
        error: 'Not authenticated',
        message: 'No user session found' 
      });
    }

    const userEmail = req.session.user.email;
    console.log('📧 Deleting account for:', userEmail);

    // Get Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // First, get the user profile to get the user_profile_id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, circle_id')
      .eq('email', userEmail)
      .single();

    if (profileError || !userProfile) {
      console.error('❌ User profile not found:', profileError);
      return res.status(404).json({ 
        error: 'User profile not found',
        message: 'Account does not exist' 
      });
    }

    const userProfileId = userProfile.id;
    const circleId = userProfile.circle_id;

    console.log('🗑️ Deleting all related data for user profile ID:', userProfileId);

    // Delete in order (respecting foreign key constraints)
    // 1. Delete XP transactions
    const { error: xpError } = await supabase
      .from('user_xp_transactions')
      .delete()
      .eq('user_profile_id', userProfileId);

    if (xpError) {
      console.error('⚠️ Error deleting XP transactions:', xpError);
    } else {
      console.log('✅ Deleted XP transactions');
    }

    // 2. Delete daily logins
    const { error: loginError } = await supabase
      .from('user_daily_logins')
      .delete()
      .eq('user_profile_id', userProfileId);

    if (loginError) {
      console.error('⚠️ Error deleting daily logins:', loginError);
    } else {
      console.log('✅ Deleted daily logins');
    }

    // 3. Delete badges
    const { error: badgesError } = await supabase
      .from('user_badges')
      .delete()
      .eq('user_profile_id', userProfileId);

    if (badgesError) {
      console.error('⚠️ Error deleting badges:', badgesError);
    } else {
      console.log('✅ Deleted badges');
    }

    // 4. Delete activity data
    const { error: activityError } = await supabase
      .from('user_activity')
      .delete()
      .eq('user_profile_id', userProfileId);

    if (activityError) {
      console.error('⚠️ Error deleting activity data:', activityError);
    } else {
      console.log('✅ Deleted activity data');
    }

    // 5. Delete gamification data
    const { error: gamificationError } = await supabase
      .from('user_gamification')
      .delete()
      .eq('user_profile_id', userProfileId);

    if (gamificationError) {
      console.error('⚠️ Error deleting gamification data:', gamificationError);
    } else {
      console.log('✅ Deleted gamification data');
    }

    // 6. Finally, delete the user profile
    const { error: profileDeleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userProfileId);

    if (profileDeleteError) {
      console.error('❌ Error deleting user profile:', profileDeleteError);
      return res.status(500).json({ 
        error: 'Failed to delete account',
        message: profileDeleteError.message 
      });
    }

    console.log('✅ Account deleted successfully');

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('⚠️ Error destroying session:', err);
      } else {
        console.log('✅ Session destroyed');
      }
    });

    res.json({ 
      success: true,
      message: 'Account deleted successfully' 
    });

  } catch (error: any) {
    console.error('❌ Error deleting account:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

