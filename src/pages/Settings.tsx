import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Bell, 
  Shield, 
  User, 
  Mail, 
  Smartphone,
  Globe,
  Moon,
  Sun,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload
} from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    contestUpdates: true,
    dailyRewards: true,
    leaderboardChanges: false,
    newContests: true,
    weeklyDigest: true
  });

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showActivity: true,
    allowMessages: true,
    dataSharing: false
  });

  // Account preferences state
  const [account, setAccount] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Here you would typically save to backend
      console.log('Saving settings:', { notifications, privacy, account, theme });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message (you could use a toast here)
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    if (!user) {
      alert('Please log in to export your data.');
      return;
    }
    
    const userData = {
      profile: user,
      settings: { notifications, privacy, account, theme },
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `10x-contest-arena-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      alert('Please log in to delete your account.');
      return;
    }

    // Double confirmation
    const confirmMessage = 'Are you absolutely sure you want to delete your account?\n\nThis will permanently delete:\n- Your profile\n- All your XP and progress\n- All your badges\n- All your activity history\n- All your daily login streaks\n\nThis action CANNOT be undone!';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Final confirmation with email
    const finalConfirm = window.prompt(
      `Please type your email "${user.email}" to confirm account deletion:`
    );

    if (finalConfirm !== user.email) {
      alert('Email does not match. Account deletion cancelled.');
      return;
    }

    try {
      setIsSaving(true);

      // Refresh session first
      await fetch(`${import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com'}/api/refresh-session`, {
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
            googleId: user?.googleId || user?.id,
            googleName: user?.name,
            googleEmail: user?.email,
            avatarUrl: user?.avatarUrl
          }
        })
      });

      // Delete account
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://leaderboard.1to10x.com'}/api/account/delete`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.message || 'Failed to delete account');
      }

      const data = await response.json();
      
      // Logout and clear local storage
      logout();
      localStorage.removeItem('10x-contest-user');
      
      // Redirect to home page
      alert('Your account has been deleted successfully.');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert(`Failed to delete account: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header - PREMIUM ENHANCEMENT */}
        <div className="flex items-center gap-4">
          <div className="icon-gradient p-3 rounded-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and privacy</p>
          </div>
        </div>

        {/* Theme Settings - PREMIUM ENHANCEMENT */}
        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="theme-toggle" className="text-base font-medium">
                  Theme
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choose between light and dark mode
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="flex items-center gap-2"
                >
                  <Sun className="w-4 h-4" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="flex items-center gap-2"
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 gradient-text">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, email: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, push: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="contest-updates">Contest Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about contest changes and deadlines
                  </p>
                </div>
                <Switch
                  id="contest-updates"
                  checked={notifications.contestUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, contestUpdates: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="daily-rewards">Daily Rewards</Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders to claim your daily rewards
                  </p>
                </div>
                <Switch
                  id="daily-rewards"
                  checked={notifications.dailyRewards}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, dailyRewards: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="new-contests">New Contests</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications when new contests are available
                  </p>
                </div>
                <Switch
                  id="new-contests"
                  checked={notifications.newContests}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, newContests: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="weekly-digest">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Weekly summary of your activity and achievements
                  </p>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, weeklyDigest: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 gradient-text">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Control your privacy and data sharing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Who can see your profile information
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={privacy.profileVisibility === 'public' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPrivacy(prev => ({ ...prev, profileVisibility: 'public' }))}
                  >
                    Public
                  </Button>
                  <Button
                    variant={privacy.profileVisibility === 'private' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPrivacy(prev => ({ ...prev, profileVisibility: 'private' }))}
                  >
                    Private
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-email">Show Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your email address on your profile
                  </p>
                </div>
                <Switch
                  id="show-email"
                  checked={privacy.showEmail}
                  onCheckedChange={(checked) => 
                    setPrivacy(prev => ({ ...prev, showEmail: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-activity">Show Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your recent activity on your profile
                  </p>
                </div>
                <Switch
                  id="show-activity"
                  checked={privacy.showActivity}
                  onCheckedChange={(checked) => 
                    setPrivacy(prev => ({ ...prev, showActivity: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow-messages">Allow Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Let other users send you messages
                  </p>
                </div>
                <Switch
                  id="allow-messages"
                  checked={privacy.allowMessages}
                  onCheckedChange={(checked) => 
                    setPrivacy(prev => ({ ...prev, allowMessages: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="data-sharing">Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anonymous usage data to improve the platform
                  </p>
                </div>
                <Switch
                  id="data-sharing"
                  checked={privacy.dataSharing}
                  onCheckedChange={(checked) => 
                    setPrivacy(prev => ({ ...prev, dataSharing: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 gradient-text">
              <User className="w-5 h-5" />
              Account Preferences
            </CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="language">Language</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred language
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={account.language === 'en' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAccount(prev => ({ ...prev, language: 'en' }))}
                  >
                    English
                  </Button>
                  <Button
                    variant={account.language === 'es' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAccount(prev => ({ ...prev, language: 'es' }))}
                  >
                    Español
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="timezone">Timezone</Label>
                  <p className="text-sm text-muted-foreground">
                    Set your local timezone
                  </p>
                </div>
                <Badge variant="outline">{account.timezone}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="date-format">Date Format</Label>
                  <p className="text-sm text-muted-foreground">
                    How dates are displayed
                  </p>
                </div>
                <Badge variant="outline">{account.dateFormat}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="currency">Currency</Label>
                  <p className="text-sm text-muted-foreground">
                    Default currency for prizes and rewards
                  </p>
                </div>
                <Badge variant="outline">{account.currency}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="glass-card-premium hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 gradient-text">
              <Download className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export your data or manage your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download a copy of your account data
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-destructive">Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;