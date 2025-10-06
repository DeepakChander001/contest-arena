import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, Zap } from "lucide-react";

export const Navbar = () => {
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/contests", label: "Contests" },
    { path: "/leaderboard", label: "Leaderboard" },
    { path: "/giveaways", label: "Prizes" },
    { path: "/leap", label: "LEAP" },
  ];

  const dashboardLinks = [
    { path: "/dashboard", label: "Overview", icon: "🏠" },
    { path: "/contests", label: "Contests", icon: "🏆" },
    { path: "/leaderboard", label: "Leaderboard", icon: "📊" },
    { path: "/progress", label: "My Progress", icon: "📈" },
    { path: "/giveaways", label: "Giveaways", icon: "🎁" },
    { path: "/leap", label: "LEAP Challenge", icon: "⚡" },
    { path: "/badges", label: "My Badges", icon: "🎖️" },
  ];

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50
        bg-black/80 backdrop-blur-lg
        border-b border-white/10
        transition-all duration-300
        ${scrolled ? 'shadow-lg shadow-cyan-500/5' : ''}
      `}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-[70px]">
            
            {/* Logo */}
            <Link 
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold hidden sm:block">10X Contest Arena</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path}
                  className={`
                    nav-link font-medium transition-all relative
                    ${isActive(link.path) 
                      ? 'text-cyan-400' 
                      : 'text-white hover:text-cyan-400'
                    }
                  `}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-cyan-400" />
                  )}
                </Link>
              ))}
              
              {/* Dashboard Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowDashboardMenu(true)}
                onMouseLeave={() => setShowDashboardMenu(false)}
              >
                <button className="
                  flex items-center gap-2 
                  font-medium text-white hover:text-cyan-400
                  transition-colors nav-link
                ">
                  Dashboard
                  <ChevronDown className={`w-4 h-4 transition-transform ${showDashboardMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showDashboardMenu && (
                  <div className="
                    absolute top-full left-0 mt-2
                    w-56 bg-zinc-900/95 backdrop-blur-lg
                    rounded-lg border border-white/10
                    shadow-2xl shadow-cyan-500/10
                    overflow-hidden
                    animate-slide-down
                  ">
                    {dashboardLinks.map((link) => (
                      <Link 
                        key={link.path}
                        to={link.path} 
                        className="nav-dropdown-item flex items-center gap-3"
                      >
                        <span>{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile Section */}
            <div className="hidden md:flex items-center gap-4">
              {/* XP Display */}
              <div className="text-cyan-400 font-mono font-bold text-sm">
                2,847 XP
              </div>
              
              {/* Level Badge */}
              <div className="
                w-10 h-10 rounded-full
                bg-gradient-to-br from-cyan-500 to-blue-500
                flex items-center justify-center
                font-bold text-sm
                shadow-lg shadow-cyan-500/30
              ">
                6
              </div>
              
              {/* Avatar with Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowProfileMenu(true)}
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <button className="
                  w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600
                  flex items-center justify-center
                  hover:ring-2 ring-cyan-400 transition
                  font-semibold text-white
                ">
                  AC
                </button>
                
                {showProfileMenu && (
                  <div className="
                    absolute top-full right-0 mt-2
                    w-64 bg-zinc-900/95 backdrop-blur-lg
                    rounded-lg border border-white/10
                    shadow-2xl shadow-cyan-500/10
                    overflow-hidden
                    animate-slide-down
                  ">
                    <div className="p-4 border-b border-white/10">
                      <div className="font-semibold">Alex Chen</div>
                      <div className="text-sm text-gray-400">
                        Level 6 • 2,847 XP
                      </div>
                    </div>
                    
                    <Link to="/profile" className="nav-dropdown-item">
                      👤 Profile
                    </Link>
                    <Link to="/settings" className="nav-dropdown-item">
                      ⚙️ Settings
                    </Link>
                    <button className="nav-dropdown-item w-full text-left text-red-400 hover:bg-red-500/10">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="
            absolute top-0 right-0 bottom-0 w-80 max-w-[85vw]
            bg-zinc-900 border-l border-white/10
            shadow-2xl
            animate-slide-in-right
            overflow-y-auto
          ">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">Menu</h2>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Section */}
            <div className="p-6 border-b border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center font-semibold">
                AC
              </div>
              <div>
                <div className="font-semibold">Alex Chen</div>
                <div className="text-sm text-gray-400">Level 6 • 2,847 XP</div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-2">
              <Link 
                to="/" 
                className="mobile-nav-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                🏠 Home
              </Link>

              <div className="py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                  Dashboard
                </div>
                {dashboardLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="mobile-nav-item pl-8"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.icon} {link.label}
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <Link 
                  to="/profile" 
                  className="mobile-nav-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👤 Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="mobile-nav-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ⚙️ Settings
                </Link>
                <button className="mobile-nav-item w-full text-left text-red-400">
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
