import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Contests from "./pages/Contests";
import Leaderboard from "./pages/Leaderboard";
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
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/contests" element={<Layout><Contests /></Layout>} />
          <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
          <Route path="/progress" element={<Layout><div className="p-8"><h1 className="text-4xl font-bold">My Progress</h1><p className="text-muted-foreground mt-2">Coming soon...</p></div></Layout>} />
          <Route path="/giveaways" element={<Layout><div className="p-8"><h1 className="text-4xl font-bold">Giveaways</h1><p className="text-muted-foreground mt-2">Coming soon...</p></div></Layout>} />
          <Route path="/leap" element={<Layout><div className="p-8"><h1 className="text-4xl font-bold">LEAP Challenge</h1><p className="text-muted-foreground mt-2">Coming soon...</p></div></Layout>} />
          <Route path="/badges" element={<Layout><div className="p-8"><h1 className="text-4xl font-bold">My Badges</h1><p className="text-muted-foreground mt-2">Coming soon...</p></div></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
