import { Flame, TrendingUp, Award } from "lucide-react";
import { LevelProgress } from "@/components/LevelProgress";
import { ContestCard } from "@/components/ContestCard";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  // Mock data - will be replaced with real API calls
  const userData = {
    level: 6,
    currentXP: 2847,
    nextLevelXP: 4000,
    monthlyXP: [120, 230, 180, 290, 310, 260, 340],
    streak: 12,
  };

  const activeContests = [
    {
      id: "1",
      title: "AI Video Generation Challenge",
      type: "QUALITY" as const,
      duration: "2 days",
      deadline: "3h 24m",
      points: 500,
      participants: 47,
      levelRequired: 4,
      isEligible: true,
    },
    {
      id: "2",
      title: "Speed Automation Task",
      type: "SPEED" as const,
      duration: "4 hours",
      deadline: "1d 5h",
      points: 300,
      participants: 92,
      levelRequired: 5,
      isEligible: true,
    },
    {
      id: "3",
      title: "Advanced RAG Implementation",
      type: "KNOWLEDGE" as const,
      duration: "1 week",
      deadline: "4d 12h",
      points: 800,
      participants: 23,
      levelRequired: 7,
      isEligible: false,
      badges: ["Achievement Badge"],
    },
  ];

  const activityFeed = [
    { type: "submit", text: "You submitted AI Video Challenge", time: "2 hours ago" },
    { type: "badge", text: "You earned Speed Champion badge", time: "5 hours ago" },
    { type: "level", text: "You leveled up to Level 6!", time: "1 day ago" },
    { type: "social", text: "@priya.sharma won the Quality Award", time: "1 day ago" },
  ];

  const stats = [
    { label: "Total Contests", value: "24", trend: "+3" },
    { label: "Win Rate", value: "31%", trend: "+5%" },
    { label: "Average Rank", value: "4.2", trend: "-0.3" },
    { label: "Badges Earned", value: "8/22", progress: 36 },
  ];

  return (
    <div className="min-h-screen p-8 space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <LevelProgress
              currentLevel={userData.level}
              currentXP={userData.currentXP}
              nextLevelXP={userData.nextLevelXP}
              size="lg"
            />
            <div>
              <h2 className="text-3xl font-bold mb-2">Level {userData.level}</h2>
              <div className="flex items-center gap-4">
                <div>
                  <span className="font-mono text-2xl font-bold text-primary">
                    {userData.currentXP.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">XP</span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-sm text-muted-foreground">
                  {(userData.nextLevelXP - userData.currentXP).toLocaleString()} XP to Level {userData.level + 1}
                </div>
              </div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(userData.currentXP / userData.nextLevelXP) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-warning" />
                <span className="font-mono text-xl font-bold">{userData.streak}</span>
              </div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Contests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Available Contests</h3>
            <Button variant="ghost" size="sm">View All →</Button>
          </div>
          <div className="space-y-4">
            {activeContests.map((contest) => (
              <ContestCard key={contest.id} {...contest} />
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Recent Activity</h3>
          <div className="glass-card p-6 space-y-4">
            {activityFeed.map((activity, idx) => (
              <div key={idx} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Quick Stats</h3>
          <div className="space-y-3">
            {stats.map((stat, idx) => (
              <div key={idx} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  {stat.trend && (
                    <span className={`text-xs font-semibold ${stat.trend.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                      {stat.trend}
                    </span>
                  )}
                </div>
                <div className="font-mono text-2xl font-bold">{stat.value}</div>
                {stat.progress !== undefined && (
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Motivation Box */}
          <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-primary" />
              <h4 className="font-bold">This Week's Top Performer</h4>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent" />
              <div>
                <p className="font-semibold">Sarah Kumar</p>
                <p className="text-xs text-muted-foreground">Level 8 • 4,892 XP</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Won 3 contests this week</p>
            <div className="pt-3 border-t border-border text-xs">
              <TrendingUp className="w-4 h-4 inline mr-1 text-primary" />
              You're in top <span className="font-semibold text-primary">15%</span> of Level 6 members
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
