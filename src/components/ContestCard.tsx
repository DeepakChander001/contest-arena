import { Trophy, Clock, Users, Lock, Award } from "lucide-react";
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
    SPEED: "bg-warning/20 text-warning border-warning/50",
    QUALITY: "bg-primary/20 text-primary border-primary/50",
    KNOWLEDGE: "bg-accent/20 text-accent border-accent/50",
    TEAM: "bg-success/20 text-success border-success/50"
  };

  return (
    <div className="glass-card-elevated p-6 space-y-4 hover-lift cursor-pointer group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-3 py-1 rounded-full border font-semibold uppercase tracking-wide ${typeColors[type]}`}>
              {type}
            </span>
            {!isEligible && (
              <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/50 font-semibold">
                🔒 Level {levelRequired}+
              </span>
            )}
          </div>
          <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
            {title}
          </h4>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {duration}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {participants} joined
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-4xl font-bold text-primary glow-text mb-1 group-hover:scale-105 transition-transform">
            +{points}
          </div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">XP</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-primary/10">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-warning animate-pulse-glow" />
          <span className="text-muted-foreground">
            Ends <span className="font-semibold text-warning">{deadline}</span>
          </span>
        </div>
        <Button
          size="sm"
          variant={isEligible ? "default" : "outline"}
          disabled={!isEligible}
          className={isEligible ? "animated-gradient hover:scale-105 transition-transform" : ""}
        >
          {isEligible ? "Join Contest →" : "Locked"}
        </Button>
      </div>
    </div>
  );
};
