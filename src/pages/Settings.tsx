import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Lock, User } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Settings</h1>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="contest-notifications">Contest Notifications</Label>
                <p className="text-sm text-gray-400">Get notified about new contests</p>
              </div>
              <Switch id="contest-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="badge-notifications">Badge Achievements</Label>
                <p className="text-sm text-gray-400">Celebrate when you earn badges</p>
              </div>
              <Switch id="badge-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="leap-notifications">LEAP Updates</Label>
                <p className="text-sm text-gray-400">Important LEAP Challenge announcements</p>
              </div>
              <Switch id="leap-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Preferences
            </CardTitle>
            <CardDescription>Control your email communications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-digest">Weekly Digest</Label>
                <p className="text-sm text-gray-400">Summary of your weekly activity</p>
              </div>
              <Switch id="weekly-digest" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing-emails">Marketing Updates</Label>
                <p className="text-sm text-gray-400">New features and platform updates</p>
              </div>
              <Switch id="marketing-emails" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="public-profile">Public Profile</Label>
                <p className="text-sm text-gray-400">Show your profile on leaderboards</p>
              </div>
              <Switch id="public-profile" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="activity-status">Activity Status</Label>
                <p className="text-sm text-gray-400">Let others see when you're online</p>
              </div>
              <Switch id="activity-status" defaultChecked />
            </div>

            <div className="pt-4 border-t border-white/10">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
