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
import { ImageUpload } from '@/components/ui/image-upload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Eye, Clock, CheckCircle, XCircle, Calendar, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays, addDays } from 'date-fns';

const offerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  age_range: z.string().min(1, 'Age range is required'),
  category: z.string().min(1, 'Category is required'),
  affiliate_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal(''))
});

type OfferFormData = z.infer<typeof offerSchema>;

const adSchema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required')
});

type AdFormData = z.infer<typeof adSchema>;

const VendorDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

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

  const adForm = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      start_date: '',
      end_date: ''
    }
  });

  useEffect(() => {
    if (user) {
      checkVendorAccess();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      fetchOffers();
      fetchAds();
    }
  }, [profile]);

  // Handle payment success on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      verifyPayment(sessionId);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkVendorAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
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
    if (!user || !profile) return;

    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('vendor_id', profile.id)
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

  const fetchAds = async () => {
    if (!user || !profile) return;

    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('vendor_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch ads",
        variant: "destructive"
      });
    } else {
      setAds(data || []);
    }
  };

  const onSubmit = async (data: OfferFormData) => {
    if (!user || !profile) return;

    const offerData = {
      title: data.title,
      description: data.description,
      age_range: data.age_range,
      category: data.category,
      affiliate_link: data.affiliate_link || null,
      image_url: data.image_url || null,
      vendor_id: profile.id,
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

  const onAdSubmit = async (data: AdFormData) => {
    if (!user || !profile) return;

    setPaymentLoading(true);
    try {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const days = differenceInDays(endDate, startDate) + 1;

      if (days <= 0) {
        toast({
          title: "Invalid Date Range",
          description: "End date must be after start date",
          variant: "destructive"
        });
        return;
      }

      const { data: sessionData, error } = await supabase.functions.invoke('create-ad-payment', {
        body: {
          startDate: data.start_date,
          endDate: data.end_date,
          days: days
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(sessionData.url, '_blank');
      
      setIsAdDialogOpen(false);
      adForm.reset();
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to create payment session",
        variant: "destructive"
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const verifyPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-ad-payment', {
        body: { sessionId }
      });

      if (error) throw error;

      if (data.paid) {
        toast({
          title: "Payment Successful!",
          description: "Your ad has been activated and will appear on the homepage.",
        });
        fetchAds();
      }
    } catch (error: any) {
      toast({
        title: "Payment Verification Error",
        description: error.message || "Failed to verify payment",
        variant: "destructive"
      });
    }
  };

  const calculatePrice = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = differenceInDays(end, start) + 1;
    return Math.max(0, days * 5); // $5 per day
  };

  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(0, differenceInDays(end, start) + 1);
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

  const getAdStatusBadge = (ad: any) => {
    const today = new Date();
    const startDate = new Date(ad.start_date);
    const endDate = new Date(ad.end_date);

    if (!ad.paid) {
      return <Badge variant="destructive">Unpaid</Badge>;
    } else if (today < startDate) {
      return <Badge variant="secondary">Scheduled</Badge>;
    } else if (today >= startDate && today <= endDate) {
      return <Badge variant="default">Active</Badge>;
    } else {
      return <Badge variant="outline">Expired</Badge>;
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
                      
                      <div className="space-y-4">
                        <ImageUpload
                          onImageUrlChange={(url) => form.setValue('image_url', url)}
                          currentImageUrl={form.watch('image_url')}
                        />
                      </div>
                      
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Ad Placements</h2>
              <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="animate-fade-in">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Ad
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Advertisement</DialogTitle>
                  </DialogHeader>
                  <Form {...adForm}>
                    <form onSubmit={adForm.handleSubmit(onAdSubmit)} className="space-y-4">
                      <FormField
                        control={adForm.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={adForm.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} min={adForm.watch('start_date') || new Date().toISOString().split('T')[0]} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {adForm.watch('start_date') && adForm.watch('end_date') && (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Duration:</span>
                            <span className="font-semibold">{calculateDays(adForm.watch('start_date'), adForm.watch('end_date'))} days</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-muted-foreground">Total Price:</span>
                            <span className="font-bold text-lg text-primary">${calculatePrice(adForm.watch('start_date'), adForm.watch('end_date'))}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">$5 per day</p>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAdDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={paymentLoading}>
                          <CreditCard className="w-4 h-4 mr-2" />
                          {paymentLoading ? 'Processing...' : 'Pay with Stripe'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>My Advertisements</CardTitle>
                <CardDescription>Track your advertising campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No advertisements created yet. Create your first ad to get started!
                        </TableCell>
                      </TableRow>
                    ) : (
                      ads.map((ad) => (
                        <TableRow key={ad.id} className="animate-fade-in">
                          <TableCell>{format(new Date(ad.start_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{format(new Date(ad.end_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{differenceInDays(new Date(ad.end_date), new Date(ad.start_date)) + 1} days</TableCell>
                          <TableCell>{getAdStatusBadge(ad)}</TableCell>
                          <TableCell>{format(new Date(ad.created_at), 'MMM dd, yyyy')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;