import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin | my-babydays";
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth?role=admin");
      } else if (user.email !== "admin@yourdomain.com") {
        navigate("/");
      }
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.email !== "admin@yourdomain.com") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Checking access…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-outfit">
      <Navbar />
      <SidebarProvider>
        <div className="min-h-screen py-16 flex w-full">
          <AdminSidebar />
          <SidebarInset>
            <header className="flex h-12 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <h1 className="text-sm font-medium">Admin</h1>
              <Badge variant="secondary" className="ml-auto">Restricted</Badge>
            </header>
            <div className="p-4">
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
