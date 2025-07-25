import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Store } from 'lucide-react';
import { format, differenceInMonths, differenceInYears } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { cn } from '@/lib/utils';

type BabyAgeGroup = '0-3 months' | '3-6 months' | '6-12 months' | '1-2 years' | '2-3 years' | '3+ years';

const Onboarding = () => {
  const [birthDate, setBirthDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'mother' | 'vendor' | null>(null);
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch user role when component mounts
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profile) {
        setUserRole(profile.role);
      }
    };
    
    fetchUserRole();
  }, [user]);

  const calculateAgeGroup = (birthDate: Date): BabyAgeGroup => {
    const now = new Date();
    const monthsDiff = differenceInMonths(now, birthDate);
    const yearsDiff = differenceInYears(now, birthDate);

    if (monthsDiff < 3) return '0-3 months';
    if (monthsDiff < 6) return '3-6 months';
    if (monthsDiff < 12) return '6-12 months';
    if (yearsDiff < 2) return '1-2 years';
    if (yearsDiff < 3) return '2-3 years';
    return '3+ years';
  };

  const handleMotherSubmit = async () => {
    if (!birthDate || !user) {
      toast({
        title: "Missing information",
        description: "Please select your baby's birthdate.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const ageGroup = calculateAgeGroup(birthDate);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          baby_birthdate: format(birthDate, 'yyyy-MM-dd'),
          baby_age: ageGroup
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile updated!",
        description: `We've set your baby's age group to ${ageGroup}.`,
      });

      navigate('/offers');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSubmit = async () => {
    if (!vendorName.trim() || !user) {
      toast({
        title: "Missing information",
        description: "Please enter your vendor/company name.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create vendor record
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .insert({
          name: vendorName.trim(),
          email: vendorEmail.trim() || user.email,
          phone: vendorPhone.trim() || null
        })
        .select()
        .single();

      if (vendorError) {
        throw vendorError;
      }

      // Update profile with vendor_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          vendor_id: vendorData.id
        })
        .eq('user_id', user.id);

      if (profileError) {
        throw profileError;
      }

      toast({
        title: "Vendor profile created!",
        description: "Welcome to our vendor platform. You can now start managing your offers.",
      });

      navigate('/vendor-dashboard');
    } catch (error) {
      console.error('Error creating vendor profile:', error);
      toast({
        title: "Error",
        description: "Failed to create your vendor profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 font-outfit">
      <Navbar />
      <div className="flex items-center justify-center p-4 pt-64">
        <Card className="w-full max-w-md animate-fade-in">
          {userRole === 'mother' ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Welcome, Mom! 💕
                </CardTitle>
                <CardDescription className="text-base">
                  Let's personalize your experience by learning about your little one
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    When was your baby born?
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12",
                          !birthDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, "PPP") : "Select baby's birthdate"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={setBirthDate}
                        disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {birthDate && (
                    <div className="p-3 bg-primary/10 rounded-lg animate-fade-in">
                      <p className="text-sm text-foreground/80">
                        Age group: <span className="font-semibold text-primary">
                          {calculateAgeGroup(birthDate)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleMotherSubmit}
                  disabled={!birthDate || loading}
                  className="w-full h-12 text-base font-semibold"
                >
                  {loading ? 'Setting up your profile...' : 'Continue to Offers'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Don't worry, you can always update this information later in your profile.
                </p>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                  <Store className="w-6 h-6" />
                  Welcome, Vendor! 🛍️
                </CardTitle>
                <CardDescription className="text-base">
                  Let's set up your vendor profile to start selling to families
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendor-name">Company/Brand Name *</Label>
                    <Input
                      id="vendor-name"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      placeholder="Enter your company or brand name"
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendor-email">Business Email (Optional)</Label>
                    <Input
                      id="vendor-email"
                      type="email"
                      value={vendorEmail}
                      onChange={(e) => setVendorEmail(e.target.value)}
                      placeholder={user?.email || "Enter business email"}
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendor-phone">Phone Number (Optional)</Label>
                    <Input
                      id="vendor-phone"
                      type="tel"
                      value={vendorPhone}
                      onChange={(e) => setVendorPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="h-12"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleVendorSubmit}
                  disabled={!vendorName.trim() || loading}
                  className="w-full h-12 text-base font-semibold"
                >
                  {loading ? 'Creating your vendor profile...' : 'Create Vendor Profile'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  You can update your business information anytime in your vendor dashboard.
                </p>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;