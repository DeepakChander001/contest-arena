import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background gradient - PREMIUM ENHANCEMENT */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-glow-pulse" />
      
      <div className="relative z-10 text-center space-y-6 animate-fade-in">
        <div className="glass-card-premium p-12 max-w-md mx-auto hover-glow card-shimmer">
          <h1 className="mb-4 text-6xl font-bold gradient-text">404</h1>
          <p className="mb-6 text-xl text-muted-foreground">Oops! Page not found</p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 btn-premium rounded-md hover:scale-105 transition-all"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
