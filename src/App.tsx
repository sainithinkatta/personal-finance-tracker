import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PasswordReset from "./components/PasswordReset";
import { OfflineIndicator } from "./components/OfflineIndicator";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthWrapper from "./components/AuthWrapper";
import { RealtimeProvider } from "./providers/RealtimeProvider";

const App = () => {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
        gcTime: 10 * 60 * 1000,   // 10 minutes - cache retention (formerly cacheTime)
        refetchOnMount: false,     // Don't refetch if data is fresh
        refetchOnWindowFocus: false, // Don't refetch on window focus
        retry: 1,                  // Retry failed requests once
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AuthWrapper>
                      <Index />
                    </AuthWrapper>
                  </ProtectedRoute>
                }
              />
              <Route path="/reset-password" element={<PasswordReset />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RealtimeProvider>
    </QueryClientProvider>
  );
};

export default App;
