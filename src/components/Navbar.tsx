import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated, loginWithGoogle } = useAuth();

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
            
            {/* Logo - Text Only */}
            <Link 
              to="/"
              className="text-xl font-bold hover:opacity-80 transition-opacity"
            >
              1to10x Contest Arena
            </Link>
            
            {/* Desktop Navigation - Only 3 items */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to="/"
                className={`
                  nav-link font-medium transition-all relative
                  ${isActive('/') 
                    ? 'text-cyan-400' 
                    : 'text-white hover:text-cyan-400'
                  }
                `}
              >
                Home
                {isActive('/') && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-cyan-400" />
                )}
              </Link>
              
              <Link 
                to="/daily-rewards"
                className={`
                  nav-link font-medium transition-all relative
                  ${isActive('/daily-rewards') 
                    ? 'text-cyan-400' 
                    : 'text-white hover:text-cyan-400'
                  }
                `}
              >
                Daily Rewards
                {isActive('/daily-rewards') && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-cyan-400" />
                )}
              </Link>
              
              <Link 
                to="/dashboard"
                className={`
                  nav-link font-medium transition-all relative
                  ${isActive('/dashboard') 
                    ? 'text-cyan-400' 
                    : 'text-white hover:text-cyan-400'
                  }
                `}
              >
                Dashboard
                {isActive('/dashboard') && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-cyan-400" />
                )}
              </Link>
            </div>
            
            {/* Profile Section */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  {/* XP Display */}
                  <div className="text-cyan-400 font-mono font-bold text-sm">
                    {(user?.currentXP ?? 0).toLocaleString()} XP
                  </div>
                  
                  {/* Level Badge */}
                  <div className="
                    w-10 h-10 rounded-full
                    bg-gradient-to-br from-cyan-500 to-blue-500
                    flex items-center justify-center
                    font-bold text-sm
                    shadow-lg shadow-cyan-500/30
                  ">
                    {user?.level ?? 1}
                  </div>
                </>
              ) : (
                <>
                  {/* Login Button */}
                  <button
                    onClick={loginWithGoogle}
                    className="
                      px-4 py-2
                      bg-gradient-to-r from-cyan-500 to-blue-500
                      text-white font-semibold text-sm
                      rounded-lg
                      hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30
                      transition-all duration-300
                    "
                  >
                    Login
                  </button>
                </>
              )}
              
              {/* Avatar with Dropdown - Only show when authenticated */}
              {isAuthenticated && (
                <div 
                  className="relative"
                  onMouseEnter={() => setShowProfileMenu(true)}
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                <button className="
                  w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600
                  flex items-center justify-center overflow-hidden
                  hover:ring-2 ring-cyan-400 transition
                  font-semibold text-white
                ">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span>
                      {(user?.name || 'U')
                        .split(' ')
                        .map(p=>p[0])
                        .join('')
                        .slice(0,2)
                      }
                    </span>
                  )}
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
                      <div className="font-semibold">{user?.name ?? 'User'}</div>
                      <div className="text-sm text-gray-400">
                        {user?.email || ''}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Level {user?.level ?? 1} • {(user?.currentXP ?? 0).toLocaleString()} XP
                      </div>
                    </div>
                    
                    <Link to="/profile" className="nav-dropdown-item">
                      👤 Profile
                    </Link>
                    <Link to="/settings" className="nav-dropdown-item">
                      ⚙️ Settings
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="nav-dropdown-item w-full text-left text-red-400 hover:bg-red-500/10"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
                </div>
              )}
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
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center font-semibold">
                  {user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
                </div>
              )}
              <div>
                <div className="font-semibold">
                  {user ? user.name : 'User'}
                </div>
                <div className="text-sm text-gray-400">
                  {user ? `Level ${user.level || 1} • ${(user.currentXP || 0).toLocaleString()} XP` : 'Not logged in'}
                </div>
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
              
              <Link 
                to="/daily-rewards" 
                className="mobile-nav-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                🎁 Daily Rewards
              </Link>
              
              <Link 
                to="/dashboard" 
                className="mobile-nav-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                📊 Dashboard
              </Link>

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
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="mobile-nav-item w-full text-left text-red-400"
                >
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
