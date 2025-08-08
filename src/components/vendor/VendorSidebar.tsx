import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ImageIcon, 
  BarChart3, 
  User, 
  CreditCard,
  Menu
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/vendor", icon: LayoutDashboard },
  { title: "My Offers", url: "/vendor/offers", icon: Package },
  { title: "Ad Placements", url: "/vendor/ads", icon: ImageIcon },
  { title: "Analytics", url: "/vendor/analytics", icon: BarChart3 },
  { title: "Profile", url: "/vendor/profile", icon: User },
  { title: "Billing", url: "/vendor/billing", icon: CreditCard },
];

export function VendorSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/vendor") {
      return location.pathname === "/vendor";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        {!collapsed && (
          <h2 className="font-semibold text-lg text-primary">Vendor Portal</h2>
        )}
        <SidebarTrigger className="h-8 w-8 bg-primary/10 hover:bg-primary/20" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/vendor"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}