import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Function to get Supabase client
const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('⚠️ Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
    console.log('🔍 SUPABASE_URL:', supabaseUrl);
    console.log('🔍 SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? 'Present' : 'Missing');
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseServiceRoleKey);
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error);
    return null;
  }
};

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * Update user profile data in Supabase database
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    console.log('📝 Updating user profile...');
    console.log('🔍 Session data:', req.session);
    console.log('🔍 Session user:', req.session?.user);

    // Check if user is authenticated - try multiple session structures
    let userEmail = null;
    
    if (req.session?.user?.email) {
      userEmail = req.session.user.email;
    } else if (req.session?.user?.googleEmail) {
      userEmail = req.session.user.googleEmail;
    } else if (req.session?.user?.id) {
      // If we only have user ID, we need to get email from database
      console.log('🔍 Found user ID in session, fetching email from database...');
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('google_id', req.session.user.id)
        .single();
      
      if (userProfile?.email) {
        userEmail = userProfile.email;
      }
    }

    // Fallback: use email from form data if session doesn't have it
    if (!userEmail && req.body.user_email) {
      userEmail = req.body.user_email;
      console.log('🔍 Using email from form data:', userEmail);
    }

    if (!userEmail) {
      console.error('❌ No user email found in session or form data');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No user session found',
      });
    }

    console.log('📧 Updating profile for:', userEmail);

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Check if Supabase is available
    if (!supabase) {
      console.log('🔄 Supabase not available, returning mock success response');
      return res.status(200).json({
        message: 'Profile updated successfully (mock mode)',
        profile: {
          email: userEmail,
          name: req.body.name || 'Updated User',
          bio: req.body.bio || '',
          headline: req.body.headline || '',
          location: req.body.location || '',
          website: req.body.website || '',
          linkedin_url: req.body.linkedin_url || '',
          instagram_url: req.body.instagram_url || '',
          facebook_url: req.body.facebook_url || '',
          profession: req.body.profession || '',
          birthday: req.body.birthday || '',
          years_of_experience: req.body.years_of_experience || '',
          topics_of_interest: req.body.topics_of_interest || '',
          primary_learning_goal: req.body.primary_learning_goal || '',
          updated_at_db: new Date(),
        }
      });
    }

    console.log('✅ Supabase client available, proceeding with database update...');

    // Extract form data
    const {
      name,
      email,
      bio,
      headline,
      location,
      website,
      linkedin_url,
      instagram_url,
      facebook_url,
      profession,
      birthday,
      years_of_experience,
      topics_of_interest,
      primary_learning_goal,
    } = req.body;

    // Handle profile image upload if provided
    let avatarUrl = null;
    if (req.file) {
      console.log('📸 Processing profile image upload...');
      
      // Convert buffer to base64 for storage (in production, use cloud storage)
      const base64Image = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      avatarUrl = `data:${mimeType};base64,${base64Image}`;
      
      console.log('✅ Profile image processed');
    }

    // Update user profile in database
    const updateData: any = {
      name: name || null,
      email: email || null,
      bio: bio || null,
      headline: headline || null,
      location: location || null,
      website: website || null,
      linkedin_url: linkedin_url || null,
      instagram_url: instagram_url || null,
      facebook_url: facebook_url || null,
      profession: profession || null,
      birthday: birthday || null,
      years_of_experience: years_of_experience || null,
      topics_of_interest: topics_of_interest || null,
      primary_learning_goal: primary_learning_goal ? [primary_learning_goal] : null,
      updated_at_db: new Date(),
    };

    // Add avatar URL if provided
    if (avatarUrl) {
      updateData.avatar_url = avatarUrl;
    }

    console.log('💾 Updating user profile data...');
    console.log('🔍 Update data:', updateData);

    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('email', userEmail)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating profile:', updateError);
      console.error('❌ Error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });

      // Check if it's an RLS error
      if (updateError.code === '42501' || updateError.message.includes('permission denied') || updateError.message.includes('RLS')) {
        console.error('🚫 RLS (Row Level Security) error detected');
        return res.status(500).json({
          error: 'Database permission denied',
          message: 'Row Level Security (RLS) is blocking this operation. Please check your Supabase RLS policies.',
          details: updateError.message,
          suggestion: 'Either disable RLS for user_profiles table or create proper policies for service role access'
        });
      }

      return res.status(500).json({
        error: 'Database update failed',
        message: updateError.message,
        details: updateError.details
      });
    }

    console.log('✅ Profile updated successfully');

    // Return updated profile data
    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });

  } catch (error: any) {
    console.error('❌ Error updating user profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to update profile',
    });
  }
};

// Export the multer middleware for use in routes
export { upload };
