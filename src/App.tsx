import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Offers from "./pages/Offers";
import VendorDashboard from "./pages/VendorDashboard";
import SavedOffers from "./pages/SavedOffers";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import OffersAdmin from "./pages/admin/OffersAdmin";
import AdsAdmin from "./pages/admin/AdsAdmin";
import UsersAdmin from "./pages/admin/UsersAdmin";
import VendorsAdmin from "./pages/admin/VendorsAdmin";
import CategoriesAdmin from "./pages/admin/CategoriesAdmin";
import MessagesAdmin from "./pages/admin/MessagesAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/saved-offers" element={<SavedOffers />} />
            <Route path="/vendor-dashboard" element={<VendorDashboard />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="offers" element={<OffersAdmin />} />
              <Route path="ads" element={<AdsAdmin />} />
              <Route path="users" element={<UsersAdmin />} />
              <Route path="vendors" element={<VendorsAdmin />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="messages" element={<MessagesAdmin />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
