import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";

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
      <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin</h1>
          <Badge variant="secondary">Restricted</Badge>
        </div>
        <nav className="border-t">
          <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto py-2">
            {[
              { to: "/admin", label: "Dashboard", end: true },
              { to: "/admin/offers", label: "Offers" },
              { to: "/admin/ads", label: "Ads" },
              { to: "/admin/users", label: "Users" },
              { to: "/admin/vendors", label: "Vendors" },
              { to: "/admin/categories", label: "Categories" },
              { to: "/admin/messages", label: "Messages" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end as any}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted ${
                    isActive ? "bg-muted text-primary" : "text-foreground"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
