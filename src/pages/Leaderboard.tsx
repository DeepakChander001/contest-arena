import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Leaderboard = () => {
  const leaderboardData = [
    { rank: 1, username: "sarah.kumar", level: 8, xp: 6847, badges: 15, contestsWon: 12, trend: "up", change: 2 },
    { rank: 2, username: "alex.rivera", level: 7, xp: 5932, badges: 13, contestsWon: 9, trend: "down", change: 1 },
    { rank: 3, username: "priya.sharma", level: 7, xp: 5421, badges: 12, contestsWon: 8, trend: "same", change: 0 },
    { rank: 4, username: "james.wilson", level: 7, xp: 4892, badges: 11, contestsWon: 7, trend: "up", change: 3 },
    { rank: 5, username: "lisa.chen", level: 6, xp: 4234, badges: 10, contestsWon: 6, trend: "up", change: 1 },
    { rank: 6, username: "you", level: 6, xp: 2847, badges: 8, contestsWon: 3, trend: "up", change: 2, isCurrentUser: true },
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return "border-l-4 border-l-[#FFD700]";
    if (rank === 2) return "border-l-4 border-l-[#C0C0C0]";
    if (rank === 3) return "border-l-4 border-l-[#CD7F32]";
    return "";
  };

  const TrendIcon = ({ trend, change }: { trend: string; change: number }) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">See where you rank among the best</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-muted">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="level">By My Level</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Your Position Card */}
      <div className="glass-card p-6 bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-5xl font-bold font-mono text-primary">#47</div>
              <div className="text-sm text-muted-foreground mt-1">Your Global Rank</div>
            </div>
            <div className="h-16 w-px bg-border" />
            <div>
              <div className="text-sm text-muted-foreground mb-1">Gap to #46</div>
              <div className="font-mono text-xl font-bold">23 XP</div>
              <div className="text-xs text-muted-foreground">@alex.chen</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold">Top 18%</span>
            </div>
            <div className="text-sm text-muted-foreground">of all members</div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total XP
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Badges
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Wins
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leaderboardData.map((entry) => (
                <tr
                  key={entry.rank}
                  className={`
                    ${getRankColor(entry.rank)}
                    ${entry.isCurrentUser ? 'bg-primary/5 glow-accent' : 'hover:bg-muted/30'}
                    transition-all duration-300
                  `}
                >
                  <td className="px-6 py-4">
                    <div className="font-mono text-lg font-bold">#{entry.rank}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent" />
                      <span className={entry.isCurrentUser ? "font-semibold text-primary" : ""}>
                        {entry.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="font-mono">
                      L{entry.level}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-semibold">{entry.xp.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono">{entry.badges}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <TrendIcon trend={entry.trend} change={entry.change} />
                      {entry.change > 0 && <span className="text-sm">{entry.change}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-semibold text-primary">{entry.contestsWon}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
