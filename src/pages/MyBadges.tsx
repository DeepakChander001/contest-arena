import { Trophy, Flame, Calendar, Zap, TrendingUp, Users, Megaphone, Lightbulb, GraduationCap, Crown, Book, Star, Lock, Award, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

const MyBadges = () => {
  const { user } = useAuth();
  
  // Map Circle tags to our badge system
  const hasExplorerTag = user?.badges?.some(badge => 
    badge.name.toLowerCase().includes('explorer')
  ) || false;
  
  const hasMasterTag = user?.badges?.some(badge => 
    badge.name.toLowerCase().includes('master')
  ) || false;

  const earnedBadges = (user?.badges?.filter(b => b.earned).length || 0);
  const totalBadges = 22;
  const badgeStats = {
    earned: earnedBadges,
    total: totalBadges,
    percentage: Math.round((earnedBadges / totalBadges) * 100),
  };

  const categories = [
    {
      name: "Achievement Badges",
      count: "2/4",
      progress: 50,
      badges: [
        { id: 1, name: "Contest Victor", icon: Trophy, earned: true, date: "October 15, 2024", description: "Won AI Automation Sprint" },
        { id: 2, name: "Speed Champion", icon: Zap, earned: true, date: "October 8, 2024", description: "Top 3 in Speed Coding Challenge" },
        { id: 3, name: "Quality Award", icon: Award, earned: false, howToEarn: "Highest community rating in creativity contest" },
        { id: 4, name: "Perfect Execution", icon: Star, earned: false, howToEarn: "Score 100% on major assessment", progress: "Highest score: 87%" },
      ],
    },
    {
      name: "Consistency Badges",
      count: "3/4",
      progress: 75,
      badges: [
        { id: 5, name: "Streak Keeper", icon: Flame, earned: true, date: "October 3, 2024", description: "Current streak: 12 days active" },
        { id: 6, name: "Perfect Attendance", icon: Calendar, earned: false, howToEarn: "Attend all live sessions", progress: "3/4 live sessions this month" },
        { id: 7, name: "Daily Devotee", icon: Zap, earned: true, date: "September 28, 2024", description: "23/31 login days this month" },
        { id: 8, name: "Points Climber", icon: TrendingUp, earned: true, date: "October 1, 2024", description: "Earned XP all 4 weeks" },
      ],
    },
    {
      name: "Community Badges",
      count: "1/5",
      progress: 20,
      badges: [
        { id: 9, name: "Team Player", icon: Users, earned: true, date: "October 10, 2024", description: "Won AI Hackathon with Team Delta" },
        { id: 10, name: "Brand Ambassador", icon: Megaphone, earned: false, howToEarn: "Share 5 verified social posts", progress: "2/5 posts" },
        { id: 11, name: "Helpful Hustler", icon: Lightbulb, earned: false, levelRequired: 6, howToEarn: "Help 10 peers (verified)", progress: "3/10 helps", note: "You're Level 6!" },
        { id: 12, name: "Peer Teacher", icon: GraduationCap, earned: false, levelRequired: 6, howToEarn: "Win peer-teaching contest OR lead community session" },
        { id: 13, name: "Community Expert", icon: Crown, earned: false, levelRequired: 6, howToEarn: "Course Master badge + help 20+ learners" },
      ],
    },
    {
      name: "Course Badges",
      count: `${hasExplorerTag ? 1 : 0}/4`,
      progress: hasExplorerTag ? 25 : 0,
      badges: [
        { id: 14, name: "Course Explorer", icon: Book, earned: hasExplorerTag, date: hasExplorerTag ? "Recently earned" : undefined, description: hasExplorerTag ? "Explorer tag earned in Circle" : undefined },
        { id: 15, name: "Course Master", icon: Star, earned: hasMasterTag, date: hasMasterTag ? "Recently earned" : undefined, description: hasMasterTag ? "Master tag earned in Circle" : undefined },
        { id: 16, name: "AI Automation Explorer", icon: Book, earned: false, howToEarn: "Enroll in AI Automation course" },
        { id: 17, name: "AI Automation Master", icon: Star, earned: false, howToEarn: "Complete 100% with passing grade" },
      ],
    },
    {
      name: "LEAP Elite Badges",
      count: "0/2",
      progress: 0,
      badges: [
        { id: 18, name: "LEAP Qualifier", icon: Ticket, earned: false, howToEarn: "Meet all 5 LEAP requirements", progress: "4/5 requirements", special: true },
        { id: 19, name: "LEAP Winner", icon: Trophy, earned: false, howToEarn: "Place Top 3 in LEAP Challenge", note: "Only 3 per month", special: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen p-8 space-y-8 animate-fade-in">
      {/* Hero Stats */}
      <div className="glass-card-premium p-8 hover-glow">
        <h1 className="text-3xl font-bold mb-6 gradient-text">My Badge Collection</h1>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{badgeStats.earned} of {badgeStats.total} Badges Earned</span>
            <span className="text-xl text-muted-foreground">{badgeStats.percentage}%</span>
          </div>
          <Progress value={badgeStats.percentage} className="h-4" />
          <p className="text-sm text-muted-foreground">Earn 2 more to reach 50% completion</p>
        </div>
      </div>

      {/* Badge Categories */}
      {categories.map((category, catIdx) => (
        <div key={catIdx} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{category.name} ({category.count})</h2>
            <Progress value={category.progress} className="w-32 h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {category.badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`glass-card-premium p-6 text-center transition-all hover-glow ${
                    badge.earned 
                      ? "hover:scale-105 border-primary/30" 
                      : "opacity-60 grayscale"
                  }`}
                >
                  <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    badge.earned ? "bg-primary/20" : "bg-muted/20"
                  }`}>
                    <Icon className={`w-12 h-12 ${badge.earned ? "text-primary" : "text-muted-foreground"}`} />
                    {!badge.earned && <Lock className="w-6 h-6 absolute text-muted-foreground" />}
                  </div>
                  
                  <h3 className="font-bold mb-2">{badge.name}</h3>
                  
                  {badge.earned ? (
                    <>
                      <div className="text-sm text-success mb-2">✓ Earned</div>
                      <div className="text-xs text-muted-foreground mb-2">{badge.date}</div>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-muted-foreground mb-2">🔒 Locked</div>
                      {badge.levelRequired && <div className="text-xs text-warning mb-2">Level {badge.levelRequired}+ Required</div>}
                      <p className="text-xs text-muted-foreground mb-2">{badge.howToEarn}</p>
                      {badge.progress && <div className="text-xs text-primary mb-2">{badge.progress}</div>}
                      {badge.note && <div className="text-xs text-muted-foreground mb-2">{badge.note}</div>}
                      <Button size="sm" variant="outline" className="mt-2">
                        {badge.progress ? "Continue" : "Start"}
                      </Button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Quick Stats */}
      <div className="glass-card-premium p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 hover-glow">
        <h3 className="text-lg font-bold mb-4">Badge Insights</h3>
        <div className="space-y-2 text-sm">
          <p>🏆 Rarest badge you have: <span className="font-bold text-primary">Speed Champion</span> (15% have this)</p>
          <p>⏭️ Next easiest to earn: <span className="font-bold text-primary">Brand Ambassador</span> (3 posts away)</p>
          <p>🎯 Complete all Achievement badges to unlock: <span className="font-bold text-primary">Elite contests</span></p>
        </div>
      </div>
    </div>
  );
};

export default MyBadges;
