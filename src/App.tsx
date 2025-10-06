import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Contests from "./pages/Contests";
import Leaderboard from "./pages/Leaderboard";
import MyProgress from "./pages/MyProgress";
import Giveaways from "./pages/Giveaways";
import LEAP from "./pages/LEAP";
import MyBadges from "./pages/MyBadges";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/contests" element={<Layout><Contests /></Layout>} />
          <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
          <Route path="/progress" element={<Layout><MyProgress /></Layout>} />
          <Route path="/giveaways" element={<Layout><Giveaways /></Layout>} />
          <Route path="/leap" element={<Layout><LEAP /></Layout>} />
          <Route path="/badges" element={<Layout><MyBadges /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
