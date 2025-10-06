import { Trophy, Clock, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ContestCardProps {
  id: string;
  title: string;
  type: "SPEED" | "QUALITY" | "KNOWLEDGE" | "TEAM";
  duration: string;
  deadline: string;
  points: number;
  participants: number;
  levelRequired: number;
  isEligible: boolean;
  badges?: string[];
}

export const ContestCard = ({
  title,
  type,
  duration,
  deadline,
  points,
  participants,
  levelRequired,
  isEligible,
  badges = []
}: ContestCardProps) => {
  const typeColors = {
    SPEED: "bg-accent/20 text-accent",
    QUALITY: "bg-success/20 text-success",
    KNOWLEDGE: "bg-warning/20 text-warning",
    TEAM: "bg-primary/20 text-primary"
  };

  return (
    <div className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
      {!isEligible && (
        <div className="absolute top-3 right-3">
          <Lock className="w-5 h-5 text-warning" />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className={typeColors[type]}>
              {type}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              Level {levelRequired}+
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{duration} • Ends in {deadline}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{participants} joined</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <span className="font-mono text-2xl font-bold text-primary">+{points}</span>
          <span className="text-xs text-muted-foreground ml-1">XP</span>
        </div>
        {isEligible ? (
          <Button className="bg-primary hover:bg-primary/90">
            Join Contest
          </Button>
        ) : (
          <Button variant="outline" disabled className="border-warning text-warning">
            <Lock className="w-4 h-4 mr-2" />
            Locked
          </Button>
        )}
      </div>
    </div>
  );
};
