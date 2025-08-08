import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  ImageIcon, 
  Calendar,
  BarChart3,
  RefreshCw,
  Pause
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Ad {
  id: string;
  headline?: string;
  image_url?: string;
  start_date: string;
  end_date: string;
  paid: boolean;
  created_at: string;
  link_url?: string;
}

export default function VendorAds() {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, [user]);

  async function fetchAds() {
    if (!user) return;

    try {
      // Get user's vendor_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("vendor_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.vendor_id) return;

      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("vendor_id", profile.vendor_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast({
        title: "Error",
        description: "Failed to load ads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const getAdStatus = (ad: Ad) => {
    const today = new Date().toISOString().split('T')[0];
    const startDate = ad.start_date;
    const endDate = ad.end_date;

    if (!ad.paid) {
      return { status: "Unpaid", variant: "destructive" as const, color: "text-destructive" };
    }
    
    if (startDate > today) {
      return { status: "Scheduled", variant: "secondary" as const, color: "text-secondary" };
    }
    
    if (endDate < today) {
      return { status: "Expired", variant: "outline" as const, color: "text-muted-foreground" };
    }
    
    return { status: "Active", variant: "default" as const, color: "text-green-600" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Ad Placements</h1>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Purchase New Ad
        </Button>
      </div>

      {ads.length === 0 ? (
        <Card className="bg-card shadow-sm border-border">
          <CardContent className="pt-12">
            <div className="text-center">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No ad placements yet</h3>
              <p className="text-muted-foreground mb-6">
                Purchase your first ad placement to boost your offers visibility
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Purchase Your First Ad
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => {
            const statusInfo = getAdStatus(ad);
            
            return (
              <Card key={ad.id} className="bg-card shadow-sm border-border overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {ad.image_url ? (
                    <img
                      src={ad.image_url}
                      alt={ad.headline || "Ad banner"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold truncate">
                      {ad.headline || "Untitled Ad"}
                    </CardTitle>
                    <Badge variant={statusInfo.variant} className={statusInfo.color}>
                      {statusInfo.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Start:</span>
                    </div>
                    <span className="font-medium">{formatDate(ad.start_date)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>End:</span>
                    </div>
                    <span className="font-medium">{formatDate(ad.end_date)}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    {statusInfo.status === "Active" && (
                      <>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Stats
                        </Button>
                      </>
                    )}
                    
                    {statusInfo.status === "Expired" && (
                      <Button variant="outline" size="sm" className="w-full">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Renew
                      </Button>
                    )}
                    
                    {statusInfo.status === "Unpaid" && (
                      <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                        Complete Payment
                      </Button>
                    )}
                    
                    {statusInfo.status === "Scheduled" && (
                      <Button variant="outline" size="sm" className="w-full">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}