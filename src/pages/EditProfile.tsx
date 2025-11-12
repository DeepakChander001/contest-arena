import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Save, User, Mail, MapPin, Globe, Linkedin, Instagram, Facebook, Calendar, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        headline: user.profileFields?.headline || "",
        location: user.profileFields?.location || "",
        website: user.profileFields?.website || "",
        linkedin_url: user.profileFields?.linkedin_url || "",
        instagram_url: user.profileFields?.instagram_url || "",
        facebook_url: user.profileFields?.facebook_url || "",
        profession: user.profileFields?.profession || "",
        birthday: user.profileFields?.birthday || "",
        years_of_experience: user.profileFields?.years_of_experience || "",
        topics_of_interest: user.profileFields?.TOI || "",
        primary_learning_goal: user.profileFields?.primary_learning_goal || "",
      });
      setPreviewImage(user.avatarUrl || null);
    }
  }, [user]);

  // Handle profile image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Refresh session before API calls
  const refreshSession = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com'}/api/refresh-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userData: {
            id: user?.id,
            email: user?.email,
            name: user?.name,
            googleId: user?.id,
            googleName: user?.name,
            avatarUrl: user?.avatarUrl
          }
        })
      });

      if (response.ok) {
        console.log('✅ Session refreshed successfully');
        return true;
      } else {
        console.error('❌ Failed to refresh session');
        return false;
      }
    } catch (error) {
      console.error('❌ Error refreshing session:', error);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First refresh the session
      await refreshSession();

      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      // Add user email for backend session fallback
      submitData.append('user_email', user?.email || '');

      // Add profile image if selected
      if (profileImage) {
        submitData.append('profile_image', profileImage);
      }

      // Call backend API to update profile
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com'}/api/user/update`, {
        method: 'PUT',
        credentials: 'include',
        body: submitData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || "Profile updated successfully!");
        
        // Refresh user data from server to get updated profile
        await refreshUserData();
        
        navigate('/profile'); // Redirect to profile page
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update profile");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to edit your profile</h2>
          <Button onClick={() => navigate('/auth')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Button>
          <h1 className="text-4xl font-bold gradient-text">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Image Section */}
          <Card className="glass-card-premium hover-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 gradient-text">
                <User className="w-5 h-5" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-2xl">
                      {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="profile-image" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-primary/30 rounded-lg hover:border-primary/50 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Upload new photo</span>
                    </div>
                  </Label>
                  <Input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="glass-card-premium hover-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 gradient-text">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => handleInputChange('headline', e.target.value)}
                  placeholder="e.g., AI Developer, Marketing Specialist"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="glass-card-premium hover-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 gradient-text">
                <Briefcase className="w-5 h-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    value={formData.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                    placeholder="e.g., Software Developer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., New York, NY"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="years_of_experience">Years of Experience</Label>
                  <select
                    id="years_of_experience"
                    value={formData.years_of_experience}
                    onChange={(e) => handleInputChange('years_of_experience', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  >
                    <option value="">Select experience</option>
                    <option value="Less than 1 Year">Less than 1 Year</option>
                    <option value="1-3 Years">1-3 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="More than 5 Years">More than 5 Years</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_learning_goal">Primary Learning Goal</Label>
                  <select
                    id="primary_learning_goal"
                    value={formData.primary_learning_goal}
                    onChange={(e) => handleInputChange('primary_learning_goal', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  >
                    <option value="">Select goal</option>
                    <option value="Upskilling">Upskilling</option>
                    <option value="Career Change">Career Change</option>
                    <option value="Networking">Networking</option>
                    <option value="Starting a Business">Starting a Business</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topics_of_interest">Topics of Interest</Label>
                <Input
                  id="topics_of_interest"
                  value={formData.topics_of_interest}
                  onChange={(e) => handleInputChange('topics_of_interest', e.target.value)}
                  placeholder="e.g., AI, Design, Marketing, Coding, Sales, Operations"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="glass-card-premium hover-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 gradient-text">
                <Globe className="w-5 h-5" />
                Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram_url" className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram_url"
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook_url" className="flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook_url"
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/username"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="glass-card-premium hover-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 gradient-text">
                <Calendar className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => handleInputChange('birthday', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/profile')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
