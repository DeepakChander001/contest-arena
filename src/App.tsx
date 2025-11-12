import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/contests" element={<Layout><Contests /></Layout>} />
            <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
            <Route path="/progress" element={<Layout><MyProgress /></Layout>} />
            <Route path="/giveaways" element={<Layout><Giveaways /></Layout>} />
            <Route path="/leap" element={<Layout><LEAP /></Layout>} />
            <Route path="/badges" element={<Layout><MyBadges /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="/profile/edit" element={<Layout><EditProfile /></Layout>} />
            <Route path="/daily-rewards" element={<Layout><DailyRewards /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
