import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Award, Trophy, Calendar, Clock, BookOpen, Target, MapPin, Globe, Linkedin, Instagram, Facebook, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
          <Button onClick={() => window.location.href = '/auth'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Format dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'N/A';
    }
  };
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold gradient-text">Profile</h1>
              <Button onClick={() => navigate('/profile/edit')} className="btn-premium">Edit Profile</Button>
        </div>

        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <div className="flex items-center gap-6">
              {user.avatarUrl ? (
                <div className="relative">
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary/30 hover:border-primary/60 transition-all"
                  />
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-glow opacity-0 hover:opacity-100 transition-opacity"></div>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-3xl border-2 border-primary/30 hover:border-primary/60 transition-all animate-pulse-glow">
                  {(user.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <div>
                <CardTitle className="text-2xl mb-2 gradient-text">{user.name || 'User'}</CardTitle>
                <p className="text-gray-400">Level <span className="text-primary font-bold">{user.level || 1}</span> • <span className="text-primary font-bold">{(user.currentXP || 0).toLocaleString()}</span> XP</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email</span>
                </div>
                <p>{user.email}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Member Since</span>
                </div>
                <p>{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Last Active</span>
                </div>
                <p>{user.lastSeenAt ? formatDate(user.lastSeenAt) : 'N/A'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">Badges Earned</span>
                </div>
                <p className="text-cyan-400 font-bold">{user.badges?.length || 0} of 22</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="gradient-text">Activity Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Total XP", value: (user.currentXP || 0).toLocaleString() },
                { label: "Posts Created", value: (user.postsCount || 0).toString() },
                { label: "Comments Made", value: (user.commentsCount || 0).toString() },
                { label: "Activity Score", value: (user.activityScore || '0.0').toString() },
              ].map((stat, idx) => (
                <div key={idx} className="stat-card-premium p-4 rounded-lg hover:scale-105 transition-all">
                  <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-mono font-bold gradient-text">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profile Information - PREMIUM ENHANCEMENT */}
        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="gradient-text">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {user.bio && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Bio</span>
                  </div>
                  <p>{user.bio}</p>
                </div>
              )}
              
              {user.profileFields?.TOI && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">Topics of Interest</span>
                  </div>
                  <p>{user.profileFields.TOI}</p>
                </div>
              )}

              {user.profileFields?.primary_learning_goal && user.profileFields.primary_learning_goal.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">Learning Goal</span>
                  </div>
                  <p>{Array.isArray(user.profileFields.primary_learning_goal) ? user.profileFields.primary_learning_goal.join(', ') : user.profileFields.primary_learning_goal}</p>
                </div>
              )}

                  {user.profileFields?.years_of_experience && user.profileFields.years_of_experience.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm">Experience</span>
                      </div>
                      <p>{Array.isArray(user.profileFields.years_of_experience) ? user.profileFields.years_of_experience.join(', ') : user.profileFields.years_of_experience}</p>
                    </div>
                  )}

                  {user.profileFields?.headline && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm">Headline</span>
                      </div>
                      <p>{user.profileFields.headline}</p>
                    </div>
                  )}

                  {user.profileFields?.location && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">Location</span>
                      </div>
                      <p>{user.profileFields.location}</p>
                    </div>
                  )}

                  {user.profileFields?.website && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Globe className="w-4 h-4" />
                        <span className="text-sm">Website</span>
                      </div>
                      <a href={user.profileFields.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {user.profileFields.website}
                      </a>
                    </div>
                  )}

                  {user.profileFields?.linkedin_url && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Linkedin className="w-4 h-4" />
                        <span className="text-sm">LinkedIn</span>
                      </div>
                      <a href={user.profileFields.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {user.profileFields.linkedin_url}
                      </a>
                    </div>
                  )}

                  {user.profileFields?.instagram_url && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Instagram className="w-4 h-4" />
                        <span className="text-sm">Instagram</span>
                      </div>
                      <a href={user.profileFields.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {user.profileFields.instagram_url}
                      </a>
                    </div>
                  )}

                  {user.profileFields?.facebook_url && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Facebook className="w-4 h-4" />
                        <span className="text-sm">Facebook</span>
                      </div>
                      <a href={user.profileFields.facebook_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {user.profileFields.facebook_url}
                      </a>
                    </div>
                  )}

                  {user.profileFields?.profession && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm">Profession</span>
                      </div>
                      <p>{user.profileFields.profession}</p>
                    </div>
                  )}

                  {user.profileFields?.birthday && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Birthday</span>
                      </div>
                      <p>{formatDate(user.profileFields.birthday)}</p>
                    </div>
                  )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
