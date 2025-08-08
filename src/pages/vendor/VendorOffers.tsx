import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Package,
  MousePointer
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Offer {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  image_url?: string;
  discount_percent?: number;
  category: string;
  age_range: string;
  affiliate_link?: string;
}

export default function VendorOffers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, [user]);

  async function fetchOffers() {
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
        .from("offers")
        .select("*")
        .eq("vendor_id", profile.vendor_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast({
        title: "Error",
        description: "Failed to load offers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteOffer(offerId: string) {
    try {
      const { error } = await supabase
        .from("offers")
        .delete()
        .eq("id", offerId);

      if (error) throw error;

      setOffers(offers.filter(offer => offer.id !== offerId));
      toast({
        title: "Success",
        description: "Offer deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast({
        title: "Error",
        description: "Failed to delete offer",
        variant: "destructive",
      });
    }
  }

  async function cloneOffer(offer: Offer) {
    try {
      // Get user's vendor_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("vendor_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.vendor_id) return;

      const { data, error } = await supabase
        .from("offers")
        .insert([{
          title: `${offer.title} (Copy)`,
          description: offer.description,
          category: offer.category,
          age_range: offer.age_range,
          affiliate_link: offer.affiliate_link,
          image_url: offer.image_url,
          discount_percent: offer.discount_percent,
          vendor_id: profile.vendor_id,
          status: "pending"
        }])
        .select()
        .single();

      if (error) throw error;
      
      setOffers([data, ...offers]);
      toast({
        title: "Success",
        description: "Offer cloned successfully",
      });
    } catch (error) {
      console.error("Error cloning offer:", error);
      toast({
        title: "Error",
        description: "Failed to clone offer",
        variant: "destructive",
      });
    }
  }

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

  const getRandomClicks = () => Math.floor(Math.random() * 500) + 50;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Offers</h1>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create New Offer
        </Button>
      </div>

      <Card className="bg-card shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Offers</CardTitle>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No offers yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first offer to start reaching customers
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Offer
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Offer</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
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
                            <div className="font-medium text-foreground">{offer.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {offer.category} • {offer.age_range}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {offer.discount_percent ? (
                          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                            {offer.discount_percent}% OFF
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(offer.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(offer.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MousePointer className="h-4 w-4" />
                          {getRandomClicks()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => cloneOffer(offer)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteOffer(offer.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}