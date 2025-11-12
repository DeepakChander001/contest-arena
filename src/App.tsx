import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Contests from "./pages/Contests";
import Leaderboard from "./pages/Leaderboard";
import MyProgress from "./pages/MyProgress";
import Giveaways from "./pages/Giveaways";
import LEAP from "./pages/LEAP";
import MyBadges from "./pages/MyBadges";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import DailyRewards from "./pages/DailyRewards";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import CreateProfile from "./pages/CreateProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contests" 
              element={
                <ProtectedRoute>
                  <Layout><Contests /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
            <Route 
              path="/progress" 
              element={
                <ProtectedRoute>
                  <Layout><MyProgress /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route path="/giveaways" element={<Layout><Giveaways /></Layout>} />
            <Route path="/leap" element={<Layout><LEAP /></Layout>} />
            <Route 
              path="/badges" 
              element={
                <ProtectedRoute>
                  <Layout><MyBadges /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Layout><Profile /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/edit" 
              element={
                <ProtectedRoute>
                  <Layout><EditProfile /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/daily-rewards" 
              element={
                <ProtectedRoute>
                  <Layout><DailyRewards /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Layout><Settings /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
