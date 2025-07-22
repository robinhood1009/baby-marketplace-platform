import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, differenceInMonths, differenceInYears } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type BabyAgeGroup = '0-3 months' | '3-6 months' | '6-12 months' | '1-2 years' | '2-3 years' | '3+ years';

const Onboarding = () => {
  const [birthDate, setBirthDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleSubmit = async () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
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
            onClick={handleSubmit}
            disabled={!birthDate || loading}
            className="w-full h-12 text-base font-semibold"
          >
            {loading ? 'Setting up your profile...' : 'Continue to Offers'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Don't worry, you can always update this information later in your profile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;