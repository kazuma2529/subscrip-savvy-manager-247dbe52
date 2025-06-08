import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Index from "./pages/Index";
import MonthlySpending from "./pages/MonthlySpending";
import NotificationSettings from "./pages/NotificationSettings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user } = useAuth();

  // ユーザーが認証されていない場合はAuthページを表示
  if (!user) {
    return <Auth />;
  }

  // 認証されている場合は通常のルートを表示
  return (
    <Routes>
      <Route path="/" element={
        <PrivateRoute>
          <Index />
        </PrivateRoute>
      } />
      <Route path="/monthly-spending" element={
        <PrivateRoute>
          <MonthlySpending />
        </PrivateRoute>
      } />
      <Route path="/notification-settings" element={
        <PrivateRoute>
          <NotificationSettings />
        </PrivateRoute>
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
