import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/vendor/VendorSidebar";
import { ProtectedVendorRoute } from "@/components/vendor/ProtectedVendorRoute";

export default function VendorLayout() {
  return (
    <ProtectedVendorRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <VendorSidebar />
          <main className="flex-1 p-6 bg-muted/30 overflow-auto">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </ProtectedVendorRoute>
  );
}