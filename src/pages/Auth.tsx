import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const Auth = () => {
  const handleLogin = () => {
    // Circle OAuth integration will go here
    console.log("Initiating Circle OAuth flow...");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-glow-pulse" />
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="glass-card p-12 text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center glow-accent">
              <Zap className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-4xl font-bold mb-3">10X Contest Arena</h1>
            <p className="text-xl text-muted-foreground">
              Compete. Level Up. Win Rewards.
            </p>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 glow-accent"
          >
            <svg
              className="w-6 h-6 mr-3"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
            Login with Circle
          </Button>

          {/* Footer */}
          <p className="text-xs text-muted-foreground pt-4">
            Powered by 10X AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
