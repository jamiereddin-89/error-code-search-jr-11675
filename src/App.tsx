import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import Favorites from "./pages/Favorites";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminFixSteps from "./pages/AdminFixSteps";
import AdminAppLogs from "./pages/AdminAppLogs";
import AdminAddErrorInfo from "./pages/AdminAddErrorInfo";
import ButtonPage from "./components/ButtonPage";
import InstallPrompt from "./components/InstallPrompt";
import AIAssistant from "./components/AIAssistant";

const queryClient = new QueryClient();

const buttonRoutes = [
  "Joule Victorum",
  "Joule Samsung",
  "Joule Modular Air",
  "DeDietrich Strateo",
  "LG Thermia",
  "Hitachi Yutaki",
  "Panasonic Aquarea",
  "Grant Areona",
  "Itec Thermia",
  "Smart Control",
  "System Status",
].map((name) => ({
  path: `/${name.toLowerCase().replace(/\s+/g, "-")}`,
  element: <ButtonPage title={name} />,
}));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InstallPrompt />
        <AIAssistant />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/fix-steps" element={<AdminFixSteps />} />
            <Route path="/admin/app-logs" element={<AdminAppLogs />} />
            <Route path="/admin/add-error-info" element={<AdminAddErrorInfo />} />
            <Route path="/pdf-files" element={<ButtonPage title="PDF Files" />} />
            {buttonRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
