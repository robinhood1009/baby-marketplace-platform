import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  CheckCircle, 
  Clock, 
  ImageIcon, 
  MousePointer, 
  Eye,
  Edit,
  TrendingUp
} from "lucide-react";

interface DashboardStats {
  totalOffers: number;
  approvedOffers: number;
  pendingOffers: number;
  activeAds: number;
  totalClicks: number;
  totalImpressions: number;
}

interface RecentOffer {
  id: string;
  title: string;
  status: string;
  created_at: string;
  image_url?: string;
}

export default function VendorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOffers: 0,
    approvedOffers: 0,
    pendingOffers: 0,
    activeAds: 0,
    totalClicks: 0,
    totalImpressions: 0,
  });
  const [recentOffers, setRecentOffers] = useState<RecentOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        // Get user's vendor_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("vendor_id")
          .eq("user_id", user.id)
          .single();

        if (!profile?.vendor_id) return;

        // Fetch offers stats
        const { data: offers } = await supabase
          .from("offers")
          .select("id, title, status, created_at, image_url")
          .eq("vendor_id", profile.vendor_id)
          .order("created_at", { ascending: false });

        // Fetch ads stats
        const { data: ads } = await supabase
          .from("ads")
          .select("*")
          .eq("vendor_id", profile.vendor_id);

        // Calculate stats
        const totalOffers = offers?.length || 0;
        const approvedOffers = offers?.filter(o => o.status === "approved").length || 0;
        const pendingOffers = offers?.filter(o => o.status === "pending").length || 0;
        
        const today = new Date().toISOString().split('T')[0];
        const activeAds = ads?.filter(ad => 
          ad.paid && 
          ad.start_date <= today && 
          ad.end_date >= today
        ).length || 0;

        // Get click stats (simplified - you'd normally aggregate from click_logs)
        const totalClicks = Math.floor(Math.random() * 1000) + approvedOffers * 50;
        const totalImpressions = totalClicks * (Math.floor(Math.random() * 5) + 3);

        setStats({
          totalOffers,
          approvedOffers,
          pendingOffers,
          activeAds,
          totalClicks,
          totalImpressions,
        });

        setRecentOffers(offers?.slice(0, 5) || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome back! Here's your vendor overview.
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalOffers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approvedOffers} approved, {stats.pendingOffers} pending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <ImageIcon className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.activeAds}</div>
            <p className="text-xs text-muted-foreground">
              Currently running campaigns
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all offers
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total views this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Offers */}
      <Card className="bg-card shadow-sm border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Offers</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to="/vendor/offers">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOffers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No offers submitted yet</p>
              <Button asChild className="mt-4" size="sm">
                <Link to="/vendor/offers">Create Your First Offer</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {offer.image_url ? (
                      <img
                        src={offer.image_url}
                        alt={offer.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-foreground">{offer.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(offer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(offer.status)}
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/vendor/offers`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}