import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Star, Eye, Shield } from 'lucide-react';

interface PendingOffer {
  id: string;
  title: string;
  description: string;
  age_range: string;
  category: string;
  affiliate_link: string | null;
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
  vendor_id: string;
}

const Admin = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pendingOffers, setPendingOffers] = useState<PendingOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (user && user.email === 'admin@yourdomain.com') {
      fetchPendingOffers();
    }
  }, [user]);

  const checkAdminAccess = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.email !== 'admin@yourdomain.com') {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
  };

  const fetchPendingOffers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingOffers(data || []);
    } catch (error) {
      console.error('Error fetching pending offers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending offers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOffer = async (offerId: string) => {
    setActionLoading(offerId);
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: 'approved' })
        .eq('id', offerId);

      if (error) throw error;

      toast({
        title: "Offer Approved",
        description: "The offer has been successfully approved and is now live.",
      });

      fetchPendingOffers();
    } catch (error) {
      console.error('Error approving offer:', error);
      toast({
        title: "Error",
        description: "Failed to approve offer",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    setActionLoading(offerId);
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: 'rejected' })
        .eq('id', offerId);

      if (error) throw error;

      toast({
        title: "Offer Rejected",
        description: "The offer has been rejected and will not appear on the site.",
        variant: "destructive"
      });

      fetchPendingOffers();
    } catch (error) {
      console.error('Error rejecting offer:', error);
      toast({
        title: "Error",
        description: "Failed to reject offer",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (offerId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ is_featured: !currentFeatured })
        .eq('id', offerId);

      if (error) throw error;

      toast({
        title: currentFeatured ? "Removed from Featured" : "Added to Featured",
        description: currentFeatured 
          ? "The offer is no longer featured." 
          : "The offer will appear in Editor's Picks when approved.",
      });

      fetchPendingOffers();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Admin Panel
              </h1>
              <p className="text-muted-foreground">Manage pending offers and site content</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => navigate('/offers')} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Site
            </Button>
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </header>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Pending Offers</span>
              <Badge variant="secondary">{pendingOffers.length}</Badge>
            </CardTitle>
            <CardDescription>
              Review and approve offers submitted by vendors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingOffers.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  No pending offers to review at the moment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Age Range</TableHead>
                      <TableHead className="text-center">Featured</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOffers.map((offer) => (
                      <TableRow key={offer.id} className="animate-fade-in">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{offer.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {offer.description}
                            </div>
                            {offer.affiliate_link && (
                              <div className="text-xs text-blue-600 truncate">
                                {offer.affiliate_link}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{offer.category}</TableCell>
                        <TableCell>{offer.age_range}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Switch
                              checked={offer.is_featured}
                              onCheckedChange={() => handleToggleFeatured(offer.id, offer.is_featured)}
                            />
                            {offer.is_featured && (
                              <Star className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(offer.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveOffer(offer.id)}
                              disabled={actionLoading === offer.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectOffer(offer.id)}
                              disabled={actionLoading === offer.id}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
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
    </div>
  );
};

export default Admin;