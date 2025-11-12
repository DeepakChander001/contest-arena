import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Mail, User, MapPin, Globe, Linkedin, Instagram, Facebook, Briefcase, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";

const CreateProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get email and name from URL params (set during Google OAuth)
  const emailFromUrl = searchParams.get('email') || '';
  const nameFromUrl = searchParams.get('name') || '';

  const [formData, setFormData] = useState({
    email: emailFromUrl,
    name: nameFromUrl,
    bio: "",
    headline: "",
    location: "",
    website: "",
    linkedin_url: "",
    instagram_url: "",
    facebook_url: "",
    profession: "",
    birthday: "",
    years_of_experience: "",
    topics_of_interest: "",
    primary_learning_goal: "",
  });

  useEffect(() => {
    // If no email in URL, redirect to login
    if (!emailFromUrl) {
      toast.error('No email found. Please login first.');
      navigate('/auth');
    }
  }, [emailFromUrl, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Refresh session first to ensure authentication
      try {
        const sessionResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com'}/api/refresh-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            userData: {
              email: formData.email,
              name: formData.name,
              googleEmail: formData.email,
              googleName: formData.name,
            }
          })
        });
        
        if (!sessionResponse.ok) {
          console.warn('⚠️ Session refresh failed, but continuing with profile creation');
        }
      } catch (sessionError) {
        console.warn('⚠️ Error refreshing session:', sessionError);
        // Continue with profile creation even if session refresh fails
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com'}/api/user/create-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Profile created successfully!');
        
        // Try to fetch Circle data and log in the user
        try {
          // Refresh session first
          await fetch(`${import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com'}/api/refresh-session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              userData: {
                email: formData.email,
                name: formData.name,
                googleEmail: formData.email,
                googleName: formData.name,
              }
            })
          });

          // Try to fetch Circle data
          try {
            const memberData = await apiService.getMemberData(formData.email);
            
            if (memberData && memberData.id) {
              // User is in Circle - fetch full data
              let spaces: any[] = [];
              try {
                spaces = await apiService.getMemberSpaces(memberData.id.toString());
              } catch (spaceError) {
                console.warn('⚠️ Could not fetch spaces:', spaceError);
              }

              const stats = apiService.calculateUserStats(memberData, spaces);

              // Create user object from Circle data
              const userData = {
                id: memberData.id.toString(),
                email: memberData.email,
                name: memberData.name || formData.name,
                avatarUrl: memberData.avatar_url || null,
                googleId: null, // Will be set from session if available
                level: memberData.gamification_stats?.current_level || 1,
                currentXP: memberData.gamification_stats?.total_points || 0,
                currentLevelXP: memberData.gamification_stats?.total_points || 0,
                nextLevelXP: memberData.gamification_stats?.points_to_next_level || 1000,
                progressPct: memberData.gamification_stats?.level_progress || 0,
                badges: memberData.member_tags?.map((tag: any) => ({
                  id: tag.id,
                  name: tag.name,
                })) || [],
                postsCount: memberData.posts_count || 0,
                commentsCount: memberData.comments_count || 0,
                activityScore: memberData.activity_score?.activity_score || "0",
                bio: memberData.flattened_profile_fields?.bio || formData.bio || null,
                profileFields: memberData.flattened_profile_fields || {},
                createdAt: memberData.created_at,
                lastSeenAt: memberData.last_seen_at,
                completedLessons: stats.completedLessons,
                totalLessons: stats.totalLessons,
                streak: stats.streak,
                spaces,
              };

              // Set user in localStorage
              localStorage.setItem('10x-contest-user', JSON.stringify(userData));
              
              // Refresh user data with the email to update AuthContext
              await refreshUserData(formData.email);
              
              // Redirect to dashboard
              navigate('/dashboard');
            } else {
              // User not in Circle yet - create basic user object from profile
              const basicUserData = {
                id: `temp-${Date.now()}`,
                email: formData.email,
                name: formData.name,
                avatarUrl: null,
                googleId: null, // Will be set from session if available
                level: 1,
                currentXP: 0,
                currentLevelXP: 0,
                nextLevelXP: 500,
                progressPct: 0,
                badges: [],
                postsCount: 0,
                commentsCount: 0,
                activityScore: "0",
                bio: formData.bio || null,
                profileFields: {},
                completedLessons: 0,
                totalLessons: 0,
                streak: 0,
                spaces: [],
              };

              // Set user in localStorage
              localStorage.setItem('10x-contest-user', JSON.stringify(basicUserData));
              
              // Refresh user data with the email to update AuthContext
              await refreshUserData(formData.email);
              
              // Redirect to dashboard
              navigate('/dashboard');
            }
          } catch (circleError: any) {
            // If Circle API fails, try to get data from database
            console.log('⚠️ Circle API failed, trying database fallback...');
            
            try {
              // Try to get user data from database
              const dbResponse = await fetch(
                `${import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com'}/api/user?email=${encodeURIComponent(formData.email)}`,
                { credentials: 'include' }
              );
              
              if (dbResponse.ok) {
                const dbUserData = await dbResponse.json();
                console.log('✅ Found user in database');
                
                // Create user object from database data
                const userData = {
                  id: dbUserData.circle_id?.toString() || `temp-${Date.now()}`,
                  email: dbUserData.email || formData.email,
                  name: dbUserData.name || formData.name,
                  avatarUrl: dbUserData.avatar_url || null,
                  googleId: dbUserData.google_id || null,
                  level: dbUserData.gamification_stats?.current_level || 1,
                  currentXP: dbUserData.gamification_stats?.total_points || 0,
                  currentLevelXP: dbUserData.gamification_stats?.total_points || 0,
                  nextLevelXP: dbUserData.gamification_stats?.points_to_next_level || 1000,
                  progressPct: dbUserData.gamification_stats?.level_progress || 0,
                  badges: dbUserData.member_tags?.map((tag: any) => ({
                    id: tag.id,
                    name: tag.name,
                  })) || [],
                  postsCount: dbUserData.posts_count || 0,
                  commentsCount: dbUserData.comments_count || 0,
                  activityScore: dbUserData.activity_score?.activity_score || "0",
                  bio: dbUserData.flattened_profile_fields?.bio || formData.bio || null,
                  profileFields: dbUserData.flattened_profile_fields || {},
                  createdAt: dbUserData.created_at,
                  lastSeenAt: dbUserData.last_seen_at,
                  completedLessons: 0,
                  totalLessons: 0,
                  streak: 0,
                  spaces: [],
                };

                // Set user in localStorage
                localStorage.setItem('10x-contest-user', JSON.stringify(userData));
                
                // Refresh user data with the email to update AuthContext
                await refreshUserData(formData.email);
                
                // Redirect to dashboard
                navigate('/dashboard');
                return;
              }
            } catch (dbError) {
              console.log('⚠️ Database fetch also failed, using basic profile');
            }
            
            // If both Circle and database fail, create basic user object
            const basicUserData = {
              id: `temp-${Date.now()}`,
              email: formData.email,
              name: formData.name,
              avatarUrl: null,
              googleId: null,
              level: 1,
              currentXP: 0,
              currentLevelXP: 0,
              nextLevelXP: 500,
              progressPct: 0,
              badges: [],
              postsCount: 0,
              commentsCount: 0,
              activityScore: "0",
              bio: formData.bio || null,
              profileFields: {},
              completedLessons: 0,
              totalLessons: 0,
              streak: 0,
              spaces: [],
            };

            // Set user in localStorage
            localStorage.setItem('10x-contest-user', JSON.stringify(basicUserData));
            
            // Refresh user data with the email to update AuthContext
            await refreshUserData(formData.email);
            
            // Redirect to dashboard
            navigate('/dashboard');
          }
        } catch (error: any) {
          console.error('Error setting up user after profile creation:', error);
          // Still redirect to dashboard - user can refresh to load data
          navigate('/dashboard');
        }
      } else {
        const errorMessage = data.message || data.error || 'Failed to create profile. Please try again.';
        const errorDetails = data.details ? `\n\nDetails: ${data.details}` : '';
        setError(errorMessage + errorDetails);
        toast.error(errorMessage);
        console.error('❌ Profile creation failed:', data);
      }
    } catch (error: any) {
      console.error('Error creating profile:', error);
      setError(error.message || 'An error occurred. Please try again.');
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="glass-card-premium w-full max-w-2xl hover-glow card-shimmer">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="icon-gradient rounded-full p-4 animate-pulse-glow">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl gradient-text">Create Your Profile</CardTitle>
          <CardDescription>
            Complete your profile to join our Circle community. We'll verify your membership and get you started!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">This email is from your Google account</p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <Label htmlFor="headline">Professional Headline</Label>
              <Input
                id="headline"
                name="headline"
                type="text"
                value={formData.headline}
                onChange={handleInputChange}
                placeholder="e.g., Software Engineer, Product Manager"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
              />
            </div>

            {/* Profession */}
            <div className="space-y-2">
              <Label htmlFor="profession" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Profession
              </Label>
              <Input
                id="profession"
                name="profession"
                type="text"
                value={formData.profession}
                onChange={handleInputChange}
                placeholder="Your profession"
              />
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <Label htmlFor="years_of_experience">Years of Experience</Label>
              <Input
                id="years_of_experience"
                name="years_of_experience"
                type="text"
                value={formData.years_of_experience}
                onChange={handleInputChange}
                placeholder="e.g., 5 years"
              />
            </div>

            {/* Primary Learning Goal */}
            <div className="space-y-2">
              <Label htmlFor="primary_learning_goal">Primary Learning Goal</Label>
              <Input
                id="primary_learning_goal"
                name="primary_learning_goal"
                type="text"
                value={formData.primary_learning_goal}
                onChange={handleInputChange}
                placeholder="What do you want to learn?"
              />
            </div>

            {/* Topics of Interest */}
            <div className="space-y-2">
              <Label htmlFor="topics_of_interest">Topics of Interest</Label>
              <Input
                id="topics_of_interest"
                name="topics_of_interest"
                type="text"
                value={formData.topics_of_interest}
                onChange={handleInputChange}
                placeholder="e.g., AI, Web Development, Design"
              />
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin_url"
                  name="linkedin_url"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram_url" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram_url"
                  name="instagram_url"
                  type="url"
                  value={formData.instagram_url}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook_url" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Label>
                <Input
                  id="facebook_url"
                  name="facebook_url"
                  type="url"
                  value={formData.facebook_url}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/yourprofile"
                />
              </div>
            </div>

            {/* Birthday */}
            <div className="space-y-2">
              <Label htmlFor="birthday" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Birthday
              </Label>
              <Input
                id="birthday"
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Create Profile'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProfile;

