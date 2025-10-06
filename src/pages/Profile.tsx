import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Award, Trophy, Calendar } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Profile</h1>
          <Button>Edit Profile</Button>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-3xl">
                AC
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">Alex Chen</CardTitle>
                <p className="text-gray-400">Level 6 • 2,847 XP</p>
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
                <p>alex.chen@example.com</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Member Since</span>
                </div>
                <p>September 2024</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm">Contests Won</span>
                </div>
                <p className="text-cyan-400 font-bold">7</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">Badges Earned</span>
                </div>
                <p className="text-cyan-400 font-bold">8 of 22</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Stats Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total XP</p>
                <p className="text-2xl font-mono font-bold text-cyan-400">2,847</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Current Streak</p>
                <p className="text-2xl font-mono font-bold text-cyan-400">12 days</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Win Rate</p>
                <p className="text-2xl font-mono font-bold text-cyan-400">31%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Contests</p>
                <p className="text-2xl font-mono font-bold text-cyan-400">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
