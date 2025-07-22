import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const offerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  age_range: z.string().min(1, 'Age range is required'),
  category: z.string().min(1, 'Category is required'),
  affiliate_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal(''))
});

type OfferFormData = z.infer<typeof offerSchema>;

const VendorDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: '',
      description: '',
      age_range: '',
      category: '',
      affiliate_link: '',
      image_url: ''
    }
  });

  useEffect(() => {
    if (user) {
      checkVendorAccess();
      fetchOffers();
    }
  }, [user]);

  const checkVendorAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !profileData || profileData.role !== 'vendor') {
      toast({
        title: "Access Denied",
        description: "You must be a vendor to access this page.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    setProfile(profileData);
  };

  const fetchOffers = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('vendor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch offers",
        variant: "destructive"
      });
    } else {
      setOffers(data || []);
    }
    setLoading(false);
  };

  const onSubmit = async (data: OfferFormData) => {
    if (!user) return;

    const offerData = {
      title: data.title,
      description: data.description,
      age_range: data.age_range,
      category: data.category,
      affiliate_link: data.affiliate_link || null,
      image_url: data.image_url || null,
      vendor_id: user.id,
      status: 'pending' as const
    };

    const { error } = await supabase
      .from('offers')
      .insert(offerData);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create offer",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Offer submitted for review",
      });
      form.reset();
      setIsDialogOpen(false);
      fetchOffers();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Vendor Dashboard
          </h1>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </header>
        
        <Tabs defaultValue="offers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offers">My Offers</TabsTrigger>
            <TabsTrigger value="placements">Ad Placements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="offers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Offers</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="animate-fade-in">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Offer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Offer</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter offer title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe your offer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="age_range"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age Range</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select age range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0-6 months">0-6 months</SelectItem>
                                <SelectItem value="6-12 months">6-12 months</SelectItem>
                                <SelectItem value="1-2 years">1-2 years</SelectItem>
                                <SelectItem value="2-3 years">2-3 years</SelectItem>
                                <SelectItem value="3+ years">3+ years</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="feeding">Feeding</SelectItem>
                                <SelectItem value="toys">Toys</SelectItem>
                                <SelectItem value="clothing">Clothing</SelectItem>
                                <SelectItem value="safety">Safety</SelectItem>
                                <SelectItem value="health">Health</SelectItem>
                                <SelectItem value="education">Education</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="affiliate_link"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Affiliate Link (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/product" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="image_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Submit Offer</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Offers Overview</CardTitle>
                <CardDescription>Track your submitted offers</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Age Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No offers submitted yet. Create your first offer to get started!
                        </TableCell>
                      </TableRow>
                    ) : (
                      offers.map((offer) => (
                        <TableRow key={offer.id} className="animate-fade-in">
                          <TableCell className="font-medium">{offer.title}</TableCell>
                          <TableCell className="capitalize">{offer.category}</TableCell>
                          <TableCell>{offer.age_range}</TableCell>
                          <TableCell>{getStatusBadge(offer.status)}</TableCell>
                          <TableCell>{new Date(offer.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="placements" className="space-y-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Ad Placements</CardTitle>
                <CardDescription>Manage your advertising campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ad Placements Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Premium advertising features will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;