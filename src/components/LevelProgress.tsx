interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  size?: "sm" | "lg";
}

export const LevelProgress = ({ currentLevel, currentXP, nextLevelXP, size = "sm" }: LevelProgressProps) => {
  const progress = (currentXP / nextLevelXP) * 100;
  const remaining = nextLevelXP - currentXP;
  
  const sizeClasses = size === "lg" 
    ? "w-32 h-32 text-2xl" 
    : "w-20 h-20 text-base";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg className={`${sizeClasses} transform -rotate-90`}>
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={size === "lg" ? "8" : "6"}
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={size === "lg" ? "8" : "6"}
            strokeDasharray={`${progress * 2.83} 283`}
            strokeLinecap="round"
            className="transition-all duration-500"
            style={{ filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`font-bold ${size === "lg" ? "text-3xl" : "text-lg"}`}>
              {currentLevel}
            </div>
            <div className={`text-muted-foreground ${size === "lg" ? "text-sm" : "text-xs"}`}>
              LEVEL
            </div>
          </div>
        </div>
      </div>
      {size === "lg" && (
        <div className="text-center">
          <div className="font-mono text-sm text-muted-foreground">
            {remaining.toLocaleString()} XP to Level {currentLevel + 1}
          </div>
        </div>
      )}
    </div>
  );
};
